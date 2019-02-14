import graphqlClient  from 'graphql-client'

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36",
    "Authorization": `bearer ${process.env.VUE_APP_GITHUB_OAUTH_TOKEN}`
}

const client = graphqlClient({
  url: 'https://api.github.com/graphql',
  headers
})


export const getRepositoryInfo = repository => client.query(`
query {
  repository(name:"${repository}", owner:"wolox-training") {
    pullRequests(first:100) {
    totalCount,
      nodes {
        number,
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
}`, null, null)
