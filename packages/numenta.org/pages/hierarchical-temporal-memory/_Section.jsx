// Numenta Web Platform and Sites source code
// MIT License (see LICENSE.txt)
// Copyright © 2005—2017 Numenta <http://numenta.com>

import MarkdownBody from 'numenta-web-shared-components/lib/MarkdownBody'
import MarkdownMedia from 'numenta-web-shared-components/lib/MarkdownMedia'
import React from 'react'

import ContentLeft from './_content/_left.md'
import ContentRight from './_content/_right.md'

import styles from './index.css'


/**
 * Hierarchical Temporal Memory (HTM) MainSection and page - React view
 *  component.
 */
const SectionHtm = () => (
  <article>
    <div className={styles.columns}>
      <div className={styles.aside}>
        <MarkdownMedia markdown={ContentRight} />
      </div>
      <div className={styles.content}>
        <MarkdownBody markdown={ContentLeft} />
      </div>
    </div>
  </article>
)

export default SectionHtm
