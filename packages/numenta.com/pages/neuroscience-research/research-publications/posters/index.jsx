// Numenta Web Platform and Sites source code
// MIT License (see LICENSE.txt)
// Copyright © 2005—2017 Numenta <http://numenta.com>

import Helmet from 'react-helmet'
import React from 'react'
import {browserHistory} from 'react-router'

import ListItem from 'numenta-web-shared-components/lib/ListItem'
import ListOrder from 'numenta-web-shared-components/lib/List'
import TextLink from 'numenta-web-shared-components/lib/TextLink'
import Title from 'numenta-web-shared-components/lib/Title'
import {sortDateDescend} from 'numenta-web-shared-utils/lib/universal'
import {getMetadataTags} from 'numenta-web-shared-utils/lib/client'

import PostListRow from '../../../../components/PostListRow'
import Pagination from '../../../../components/Pagination'
import styles from './index.css'
import Metatags from './_metatags.md'

const title = 'Posters'
const ITEMS_PER_PAGE = 5

/**
 * Posters page - React view component.
 */
export default class PostersPage extends React.Component {

  static contextTypes = {
    route: React.PropTypes.object,
    config: React.PropTypes.object,
  }
  static propTypes = {
    location: React.PropTypes.object,
  }

  componentWillMount() {
    // Merge location state
    const {location} = this.props
    const state = {year: 0, position: 0}
    if (location) {
      Object.assign(state, location.state)
    }
    this.setState(state)
  }
  componentWillReceiveProps(nextProps) {
    // Merge location state
    const {location} = nextProps
    const state = {year: 0, position: 0}
    if (location) {
      Object.assign(state, location.state)
    }
    this.setState(state)
  }

  _yearChanged(event) {
    // Reset postion to first page when changing the year
    const year = parseInt(event.target.value, 0)
    const state = Object.assign({}, this.state, {position: 0, year})
    this.setState(state)

    // Update history to include the new state
    const {location} = this.props
    const {key, pathname, query, hash} = location
    browserHistory.push({
      key, pathname, query, hash, state,
    })
  }
  render() {
    const {route, config} = this.context
    const {pages} = route
    const {links} = config
    const {year, position} = this.state
    const from = position || 0
    const to = from + ITEMS_PER_PAGE

    // Filter all markdown files below the current location
    const pathname = links.in.posters.substr(1)
    const filter = new RegExp(`^${pathname}.*\\.md`)
    const allPosts = pages.filter(({file}) => file.path.match(filter))

    // Collect categories and years from posts
    const years = new Set()
    allPosts.forEach((post) =>
      years.add(new Date(post.data.date).getFullYear()))

    // Build Year filter
    const yearsOptions = Array.from(years).sort()
      .map((yyyy) => <option value={yyyy}>{yyyy}</option>)

    // Filter posts
    let posts
    if (year === 0) {
      posts = allPosts
    }
    else {
      posts = allPosts.filter((post) => {
        const yyyy = new Date(post.data.date).getFullYear()
        return yyyy === year
      })
    }
    // Build list for the visible items
    const items = posts.sort(sortDateDescend)
                       .slice(from, to)
                       .map((post) => (
                         <ListItem key={post.file.stem}>
                           <PostListRow post={post} />
                         </ListItem>
                       ))

    return (
      <article>
        <Helmet title={Metatags.title}>
          {getMetadataTags(Metatags, config.baseUrl)}
        </Helmet>
        <span>
          <TextLink to={links.in.publications}>
            Research Publications
          </TextLink>
        </span>

        <Title headline={true}>
          {title}
          <span className={styles.filter}>
            <select
              className={styles.select}
              onChange={(e) => this._yearChanged(e)}
              value={year}
            >
              <option value="0">All Years</option>
              {yearsOptions}
            </select>
          </span>
        </Title>
        <ListOrder copy={false}>
          {items}
        </ListOrder>
        <Pagination
          position={from}
          itemsPerPage={ITEMS_PER_PAGE}
          total={posts.length}
        />
      </article>
    )
  }
}
