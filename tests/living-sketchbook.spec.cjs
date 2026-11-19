const { test, expect } = require('@playwright/test');
const pages = ['index.html','gallery.html','artist.html','play.html'];
for (const path of pages) {
  for (const width of [320,375,430,768,1024,1280]) {
    test(path + ' responsive ' + width, async ({ page }) => {
      await page.setViewportSize({width,height:850});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto('/'+path);
      await expect(page.locator('.nav-mark')).toBeVisible();
      await expect(page.locator('body')).toBeVisible();
      await expect.poll(async()=>{
        const layout=await page.evaluate(()=>{
          const width=innerWidth;
          const overflow=[...document.querySelectorAll('body *')].filter(el=>{
            const rect=el.getBoundingClientRect();
            const css=getComputedStyle(el);
            return css.position!=='fixed' && css.display!=='none' && rect.width>0 && (rect.right>width+2 || rect.left< -2);
          }).slice(0,12).map(el=>({tag:el.tagName,cls:String(el.className).slice(0,80),left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right)}));
          return {fits:document.documentElement.scrollWidth<=width+2,scrollWidth:document.documentElement.scrollWidth,width,overflow};
        });
        if(!layout.fits) console.log('MOBILE OVERFLOW DIAGNOSTICS',path,width,JSON.stringify(layout));
        return layout.fits;
      }).toBe(true);
      if(width<=720){
        const toggle=page.locator('.nav-toggle');
        await expect(toggle).toBeVisible();
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded','true');
        await expect(page.locator('#primaryNav')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(toggle).toHaveAttribute('aria-expanded','false');
      }
      expect(errors).toEqual([]);
    });
  }
}
test('gallery keyboard lightbox and filter',async({page})=>{
  await page.goto('/gallery.html');
  const art=page.locator('.art').first();
  await art.focus();await page.keyboard.press('Enter');
  await expect(page.locator('#lightbox')).toHaveClass(/is-open/);
  await expect(page.locator('#lbImg')).toHaveAttribute('src',/.+/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#lightbox')).not.toHaveClass(/is-open/);
  await expect(art).toBeFocused();
  const filter=page.locator('.filter').last();await filter.click();
  await expect(filter).toHaveAttribute('aria-pressed','true');
});
test('artist desk palettes and studio cat',async({page})=>{
  await page.goto('/index.html');
  const desk=page.locator('#artistsDesk');
  await expect(desk).toBeVisible();
  await desk.locator('[data-ink]').nth(2).click();
  await expect(desk.locator('.desk-color-name')).toHaveText('garden light');
  await expect(desk.locator('[data-ink]').nth(2)).toHaveAttribute('aria-pressed','true');
  await page.locator('#sketchCat').click();
  await expect(page.locator('#sketchCatNote')).toBeVisible();
});
test('reduced motion retains usable content',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/index.html');
  await expect(page.locator('#artistsDesk')).toBeVisible();
  await expect(page.locator('.easel-card').first()).toBeVisible();
});

test('artwork images load successfully', async ({page}) => {
  for (const path of pages) {
    await page.goto('/'+path);
    const images=page.locator('img[src]');
    const count=await images.count();
    for(let i=0;i<count;i++){
      const img=images.nth(i);
      await img.evaluate(el=>{el.loading='eager';});
    }
    await expect.poll(async()=>page.locator('img[src]').evaluateAll(imgs=>
      imgs.filter(img=>!img.complete).length
    ),{timeout:10000}).toBe(0);
    const broken=await images.evaluateAll(imgs=>imgs.filter(img=>img.naturalWidth===0).map(img=>img.getAttribute('src')));
    expect(broken, path+' broken images').toEqual([]);
  }
});
test('touch navigation works on narrow phones',async({browser})=>{
  const context=await browser.newContext({viewport:{width:320,height:700},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.goto('/index.html');
  const toggle=page.locator('.nav-toggle');
  await toggle.tap();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await page.locator('#primaryNav a[href="gallery.html"]').tap();
  await expect(page).toHaveURL(/gallery.html$/);
  await context.close();
});
