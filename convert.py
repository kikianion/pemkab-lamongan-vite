import asyncio
import pathlib
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(device_scale_factor=2)
        svg_path = pathlib.Path(__file__).parent / 'lmgmap2_1.svg'
        uri = svg_path.absolute().as_uri()
        print(f'Loading {uri}')
        await page.goto(uri)
        svg = await page.query_selector('svg')
        if svg:
            box = await svg.bounding_box()
            if box:
                await page.set_viewport_size({'width': int(box['width'] + 50), 'height': int(box['height'] + 50)})
            out_path = pathlib.Path(__file__).parent / 'lmgmap2_1.png'
            await svg.screenshot(path=str(out_path))
            print(f'Saved {out_path} using SVG element screenshot')
        else:
            out_path = pathlib.Path(__file__).parent / 'lmgmap2_1.png'
            await page.screenshot(path=str(out_path), full_page=True)
            print(f'Saved {out_path} using full page screenshot')
        await browser.close()

asyncio.run(main())
