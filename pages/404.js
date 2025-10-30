import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData } from '@/lib/db/getSiteData'
import { DynamicLayout } from '@/themes/theme'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * 404页面 - 确保返回正确的404状态码
 * @param {*} props
 * @returns
 */
const NoFound = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  const router = useRouter()

  useEffect(() => {
    // 确保在客户端也设置正确的状态
    if (typeof window !== 'undefined') {
      // 设置页面标题
      document.title = `404 - 页面未找到 | ${siteConfig('TITLE', BLOG.TITLE, props.NOTION_CONFIG)}`
      
      // 记录404错误到控制台（用于调试）
      console.warn(`404 Error: Page not found - ${router.asPath}`)
    }
  }, [router.asPath, props.NOTION_CONFIG])

  return <DynamicLayout theme={theme} layoutName='Layout404' {...props} />
}

export async function getStaticProps(req) {
  const { locale } = req

  const props = (await getGlobalData({ from: '404', locale })) || {}
  
  // 确保返回404状态码
  return { 
    props: {
      ...props,
      statusCode: 404
    }
  }
}

export default NoFound
