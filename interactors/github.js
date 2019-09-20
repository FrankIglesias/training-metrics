import graphqlClient from 'graphql-client'

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
  Authorization: `bearer ${process.env.NUXT_ENV_GITHUB_OAUTH_TOKEN}`
}

const client = graphqlClient({
  url: 'https://api.github.com/graphql',
  headers
})

export const getRepositoryInfo = ({ repository, organization = 'Wolox' }) =>
  client.query(
    `
query {
  repository(name:"${repository}", owner:"${organization}") {
    closed_pull_requests: pullRequests(states:CLOSED) {
      totalCount
    }
    merged_pull_requests: pullRequests(states:MERGED) {
      totalCount
    }
    open_pull_requests: pullRequests(states:OPEN) {
      totalCount
    }
    total_pull_requests: pullRequests {
      totalCount
    }
    pullRequests(first: 100, orderBy: {field: CREATED_AT, direction:DESC} ) {
      nodes {
        number,
        updatedAt,
        state,
        title,
        url,
        deletions,
        additions,
        createdAt,
        mergedAt,
        author {
          login
        }
        reviews(first: 100) {
          totalCount
          edges {
            node {
              comments {
                totalCount
              }
            }
          },
          nodes {
            createdAt,
            state,
            commit {
              author {
               date
              }
            }
            author {
              login,
              avatarUrl,
              url
            }
          }
        }
      }
    }
  }
}`,
    null,
    null
  )
