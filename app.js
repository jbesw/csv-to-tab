'use strict'

const csv = require("csvtojson/v2")
const fs = require('fs')

// Run this as follows: node app.js input.csv output.tab
// where input.csv is the input file and output.tab is the output file.

const file_in = process.argv[2]
const file_out = process.argv[3]

const convert = async () => {
    // // Load file
    let raw = fs.readFileSync(file_in).toString()

    // Remove first line of meta data
    raw = raw.substring(raw.indexOf("\n") + 1)

    // Load CSV into JSON
    const input = await csv().fromString(raw)

    // New structure
    const output = []
    input.map (item => {

        // Convert link
        let key = item.link.replace('https://', '').replace(/\/$/, '').substring(0,100)

        // Convert category
        let category = item.item_tags.replace(/blog-posts#post-tags#.+?,/g, '')
                                     .replace(/blog-posts#category#/g, '')
                                     .replace(/,blog-posts#post-tags#.+\r/g, /\r/)
                                     .replace(/blog-posts#category-.+?#/g, '')
                                     .replace(/learning-levels,|,learning-levels/g, '')
                                     .replace(/uncategorized,|,uncategorized/g, '')
                                     .replace(/\runcategorized/, /\r/g)
                                     .replace(/blog-posts#post-tags#.+/, '')
                                     .replace(/,Global#content-type#blog-post/gi, '')
                                     .replace(/Global#content-type#blog-post/gi, '')

        // If category now starts with a common, drop it
        if (category.charAt( 0 ) === ',') {
            category = category.slice( 1 )
        }

        // Convert title
        let title = item.title.replace(/&#8211;/g, '-')
                              .replace(/&#8217;/g, '\'')
                              .replace(/&amp;/g, '&')
                              .replace(/&#8220;/g, '')
                              .replace(/&#8221;/g, '')
                              .replace(/&#8216/g, '\'')
                              .replace(/&#8212;/g, ' - ')
                              .replace(/&#038;/g, 'and')
                              .replace(/&#8230;/g, '')
                              .replace(/&mdash;/g, '-')
                              .replace(/&nbsp;/g, ' ')
                              .replace(/&gt;/g, '-')
                              .replace(/&quot;/g, '"')
                              .replace(/&#215;/g, 'x')

        // Contributors
        let authors = item.contributors.replace(/, /, /,/)

        output.push({
            key,
            category,
            displayDate: item.displayDate,
            title,
            authors: item.contributors
        })
    })

    // Write the new file
    let headers = [
        '## SC\tSiteCatalyst SAINT Import File\tv:2.1',
        '## SC\t\'## SC\' indicates a SiteCatalyst pre-process header. Please do not remove these lines.',
        '## SC\tD:2021-03-22 12:09:32\tA:200526:279',
        'Key\tPage Blog Post Category (pages)\tPage Blog Post Title (pages)\tPage Blog Post Date Page (pages)\tPage Blog Post Authors (pages)'
    ]

    // Generate output buffer
    let data = ''
    headers.map((header) => data += header + '\n')
    output.map((post) => data += `${post.key}\t${post.category}\t${post.title}\t${post.displayDate}\t${post.authors}\n`)

    fs.writeFileSync(file_out, data)
}

convert()