// pages/sitemap.xml.js
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData } from '@/lib/db/getSiteData'
import { extractLangId, extractLangPrefix } from '@/lib/utils/pageId'
import { getServerSideSitemap } from 'next-sitemap'

export const getServerSideProps = async ctx => {
  let fields = []
  const siteIds = BLOG.NOTION_PAGE_ID.split(',')

  for (let index = 0; index < siteIds.length; index++) {
    const siteId = siteIds[index]
    const id = extractLangId(siteId)
    const locale = extractLangPrefix(siteId)
    // 第一个id站点默认语言
    const siteData = await getGlobalData({
      pageId: id,
      from: 'sitemap.xml'
    })
    const link = siteConfig(
      'LINK',
      siteData?.siteInfo?.link,
      siteData.NOTION_CONFIG
    )
    const localeFields = generateLocalesSitemap(link, siteData.allPages, locale)
    fields = fields.concat(localeFields)
  }

  fields = getUniqueFields(fields);

  // 优化缓存设置 - 更长的缓存时间，更好的SEO性能
  ctx.res.setHeader(
    'Cache-Control',
    'public, max-age=86400, stale-while-revalidate=3600'
  )
  
  // 添加额外的SEO相关头部
  ctx.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  ctx.res.setHeader('X-Robots-Tag', 'noindex')
  
  return getServerSideSitemap(ctx, fields)
}

function generateLocalesSitemap(link, allPages, locale) {
  // 使用固定域名进行SEO优化
  const siteUrl = 'https://blog.zhishigongxiang.com'
  
  if (locale && locale.length > 0 && locale.indexOf('/') !== 0) {
    locale = '/' + locale
  }
  const dateNow = new Date().toISOString()
  
  // 只保留网站首页 - 最高优先级，每日更新
  const defaultFields = [
    {
      loc: `${siteUrl}${locale}`,
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '1.0'
    }
  ]
  
  // 只保留已发布的文章页面，使用 /article/ 路径前缀
  const postFields =
    allPages
      ?.filter(p => p.status === BLOG.NOTION_PROPERTY_NAME.status_publish && p.type === 'Post')
      ?.map(post => {
        const slugWithoutLeadingSlash = post?.slug.startsWith('/')
          ? post?.slug?.slice(1)
          : post.slug
        
        // 根据文章发布时间计算更新频率
        const publishDate = new Date(post?.publishDay)
        const daysSincePublish = Math.floor((Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // 动态设置更新频率：新文章更频繁，老文章较少
        let changefreq = 'monthly'
        let priority = '0.8'
        
        if (daysSincePublish <= 7) {
          changefreq = 'daily'
          priority = '0.9'
        } else if (daysSincePublish <= 30) {
          changefreq = 'weekly'
          priority = '0.8'
        } else if (daysSincePublish <= 90) {
          changefreq = 'monthly'
          priority = '0.7'
        } else {
          changefreq = 'yearly'
          priority = '0.6'
        }
        
        return {
          loc: `${siteUrl}${locale}/article/${slugWithoutLeadingSlash}`,
          lastmod: post?.lastEditedDay ? new Date(post.lastEditedDay).toISOString() : publishDate.toISOString(),
          changefreq: changefreq,
          priority: priority
        }
      }) ?? []

  return defaultFields.concat(postFields)
}

function getUniqueFields(fields) {
  const uniqueFieldsMap = new Map();

  fields.forEach(field => {
    const existingField = uniqueFieldsMap.get(field.loc);

    if (!existingField || new Date(field.lastmod) > new Date(existingField.lastmod)) {
      uniqueFieldsMap.set(field.loc, field);
    }
  });

  return Array.from(uniqueFieldsMap.values());
}

export default () => {}
