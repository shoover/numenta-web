import {createSitemap} from 'sitemap'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import fs from 'fs'
import htmlToText from 'html2plaintext'
import {ncp} from 'ncp'
import toml from 'toml'

/* eslint-disable no-console */

const config = toml.parse(fs.readFileSync(`${__dirname}/config.toml`))

// Default max of 10 EventEmitters is not enough for our MainSections, bump up.
require('events').EventEmitter.prototype._maxListeners = 20  // eslint-disable-line max-len, no-underscore-dangle

/**
 * Gatsby.js Node server-side specific functions.
 *  1. modifyWebpackConfig()
 *  2. postBuild()
 * @see https://github.com/gatsbyjs/gatsby#structure-of-a-gatsby-site
 */


/**
 * Gatsby augment WebPack loaders config.
 * @param {Object} webpack - Previous Gatsby Webpack Configurator object
 * @param {String} env - Gatsby Environment Runway ('develop', etc.)
 * @returns {Object} - Next Gatsby Webpack Configurator object
 * @see https://github.com/gatsbyjs/gatsby#how-to-use-your-own-webpack-loaders
 */
export function modifyWebpackConfig(webpack, env) {
  const cssOptions = [
    'modules',
    'localIdentName=[name]_[local]_[hash:base64:3]',
    'importLoaders=1',
  ].join('&')
  const cssModules = `css?${cssOptions}`

  // dev source maps
  if (env === 'develop') {
    webpack.merge({devtool: 'source-map'})
  }

  // css modules
  webpack.removeLoader('css')
  if (env === 'develop') {
    console.log(env, 'Init CSS Modules in Development mode...')
    webpack.loader('css', {
      test: /\.css$/,
      loaders: ['style', cssModules, 'postcss'],
    })
  }
  else {
    console.log(env, 'Init CSS Modules in Production mode...')
    webpack.loader('css', {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style', [cssModules, 'postcss']),
    })
    webpack.merge({
      plugins: [new ExtractTextPlugin('styles.css', {ignoreOrder: true})],
    })
  }

  // bitmap images with file-loader (like gatsby svg default)
  webpack.removeLoader('gif')
  webpack.removeLoader('jpg')
  webpack.removeLoader('png')
  webpack.loader('gif', {
    test: /\.(gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loaders: ['file-loader'],
  })
  webpack.loader('jpg', {
    test: /\.(jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loaders: ['file-loader'],
  })
  webpack.loader('png', {
    test: /\.(png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loaders: ['file-loader'],
  })

  // webpack path: static asset build + config:linkPrefix (gh-pages, etc)
  if (env !== 'develop') {
    console.log(env, 'Init correct webpack asset publicPath in Prod mode...')
    webpack.merge({
      output: {publicPath: `${config.linkPrefix}/`},
    })
  }

  return webpack
}

/**
 * Gatsby post-build callback.
 *  1. Build client-side search index
 *  2. Build XML sitemap for search crawlers
 *  3. Copy static assets to build output dir
 * @param {Array} pages - List of built pages
 * @param {Function} [callback] - Node-style async function(error, result) {}
 * @returns {Function} - Executed async callback function
 * @see https://github.com/gatsbyjs/gatsby#perform-additional-post-build-step
 */
export function postBuild(pages, callback) {
  // prep search index
  const searchSkip = [
    '/blog/',
    '/events/',
    '/newsletter/',
    '/papers/',
    '/press/',
  ]
  const searches = pages
    .filter((page) => (page.path && !searchSkip.includes(page.path)))
    .map(({path}) => {
      const html = fs.readFileSync(`./public/${path}/index.html`).toString()
      const title = html
        .match(/<title[\s\S]*?>([\s\S]*?)<\/title>/)[1]
        .replace(/ \| Numenta.com$/, '')
      console.log(title)
      const main = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/)[1]
      console.log(main)
      const text = htmlToText(main)
      console.log(text)
      return {path, text, title}
    })
  // prep sitemap
  const urls = pages
    .filter((page) => page.path)
    .map(({path}) => ({
      url: path,
      changefreq: 'daily', // 'monthly'
      priority: 0.3, // 0.7
    }))
  const sitemap = createSitemap({
    hostname: 'http://numenta.com',
    urls,
  })

  console.log('postBuild generate search index')
  fs.writeFileSync('public/_searchIndex.json', JSON.stringify(searches))

  console.log('postBuild generate sitemap')
  fs.writeFileSync('public/sitemap.xml', sitemap.toString())

  console.log('postBuild static asset copy')
  return ncp('static/', 'public/', callback)
}

/* eslint-enable no-console */
