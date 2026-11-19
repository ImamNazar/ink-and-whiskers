const { test, expect } = require('@playwright/test');
const pages = ['index.html','gallery.html','artist.html','play.html'];
for (const path of pages) {
  for (const width of [375,768,1280]) {
    test(path + ' responsive ' + width, async ({ page }) => {
      await page.setViewportSize({width,height:850});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto('/'+path);
      await expect(page.locator('.nav-mark')).toBeVisible();
      await expect(page.locator('body')).toBeVisible();
      await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+2)).toBe(true);
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
