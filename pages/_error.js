import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData } from '@/lib/db/getSiteData'
import { DynamicLayout } from '@/themes/theme'
import Head from 'next/head'

/**
 * 错误页面 - 处理各种HTTP错误状态码
 * @param {*} props
 * @returns
 */
export default function ErrorPage({ statusCode, hasGetInitialPropsRun, err, ...props }) {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  const title = siteConfig('TITLE', BLOG.TITLE, props.NOTION_CONFIG)
  
  // 根据状态码显示不同的错误信息
  const getErrorMessage = (code) => {
    switch (code) {
      case 404:
        return '页面未找到'
      case 500:
        return '服务器内部错误'
      case 403:
        return '访问被拒绝'
      case 401:
        return '未授权访问'
      default:
        return '发生了一个错误'
    }
  }

  const errorMessage = getErrorMessage(statusCode)

  return (
    <>
      <Head>
        <title>{statusCode} - {errorMessage} | {title}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content={`${statusCode} 错误 - ${errorMessage}`} />
      </Head>
      
      {statusCode === 404 ? (
        <DynamicLayout theme={theme} layoutName='Layout404' {...props} statusCode={statusCode} />
      ) : (
        <DynamicLayout theme={theme} layoutName='LayoutError' {...props} statusCode={statusCode} errorMessage={errorMessage} />
      )}
    </>
  )
}

ErrorPage.getInitialProps = async ({ res, err, req }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  
  // 确保服务端返回正确的状态码
  if (res && statusCode) {
    res.statusCode = statusCode
  }

  // 获取全局数据用于布局
  let props = {}
  try {
    const locale = req?.locale
    props = (await getGlobalData({ from: 'error', locale })) || {}
  } catch (error) {
    console.error('Error loading global data in error page:', error)
  }

  return { 
    statusCode,
    hasGetInitialPropsRun: true,
    ...props
  }
}