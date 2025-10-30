import fs from 'fs'

export function generateRobotsTxt(props) {
  const { siteInfo } = props
  const LINK = 'https://blog.zhishigongxiang.com'
  const content = `User-agent: *
Allow: /
Disallow: /page/
Disallow: /tag/
Disallow: /category/
Disallow: /search/
Disallow: /archive/
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# 搜索引擎特定规则
User-agent: Googlebot
Allow: /
Disallow: /page/
Disallow: /tag/
Disallow: /category/

User-agent: Bingbot
Allow: /
Disallow: /page/
Disallow: /tag/
Disallow: /category/

User-agent: Baiduspider
Allow: /
Disallow: /page/
Disallow: /tag/
Disallow: /category/
Crawl-delay: 1

# 站点地图
Sitemap: ${LINK}/sitemap.xml

# 爬取延迟
Crawl-delay: 1`
  
  try {
    fs.mkdirSync('./public', { recursive: true })
    fs.writeFileSync('./public/robots.txt', content)
  } catch (error) {
    // 在vercel运行环境是只读的，这里会报错；
    // 但在vercel编译阶段、或VPS等其他平台这行代码会成功执行
  }
}
