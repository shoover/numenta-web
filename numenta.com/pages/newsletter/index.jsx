import React from 'react'

import {sortDateDescend} from '../../utils/shared'

import Button from '../../components/Button'
import Form from '../../components/Form'
import FormInput from '../../components/FormInput'
import FormLabel from '../../components/FormLabel'
import FormRow from '../../components/FormRow'
import List from '../../components/List'
import ListItem from '../../components/ListItem'
import PostListItem from '../../components/PostListItem'
import Section from '../../components/Section'

import styles from './index.css'


/**
 *
 */
const NewsletterPage = (props, {route}) => {
  const {pages} = route
  const posts = pages.filter(({file}) => (
    (file.path.match(/^newsletter\/.*\.md/))
  ))
  const items = posts.sort(sortDateDescend).map((post) => (
    <ListItem key={post.file.stem}>
      <PostListItem post={post} />
    </ListItem>
  ))

  return (
    <div>
      <div className={styles.signup}>
        {/* eslint-disable max-len */}
        <Form
          action="//numenta.us2.list-manage.com/subscribe/post?u=b838879da2baa539870afd320&amp;id=23e65d3407"
          method="post"
          name="mc-embedded-subscribe-form"
        >
          <FormRow>
            <div className={styles.field}>
              <FormLabel htmlFor="EMAIL">Newsletter Signup</FormLabel>
              <FormInput
                name="EMAIL"
                placeholder="name@company.com"
                stretch="large"
                type="email"
              />
              <Button theme="short" type="submit">Send</Button>
            </div>
          </FormRow>
          <FormInput
            name="b_b838879da2baa539870afd320_23e65d3407"
            type="hidden"
            value=""
          />
        </Form>
        {/* eslint-enable max-len */}
      </div>

      <Section headline={true} open={true} title="Newsletter">
        <List copy={false}>
          {items}
        </List>
      </Section>
    </div>
  )
}

NewsletterPage.contextTypes = {
  route: React.PropTypes.object,
}

export default NewsletterPage
