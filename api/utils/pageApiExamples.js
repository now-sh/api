const get = (label, path, token = false) => ({ label, method: 'GET', path, token });
const post = (label, path, body, token = false) => ({ label, method: 'POST', path, body, token });
const put = (label, path, body, token = false) => ({ label, method: 'PUT', path, body, token });
const patch = (label, path, body, token = false) => ({ label, method: 'PATCH', path, body, token });
const del = (label, path, token = false) => ({ label, method: 'DELETE', path, token });
const shell = (label, command) => ({ label, command });

const pageExamples = {
  '/': [
    get('GitHub profile', '/api/v1/me/info/github'),
    get('Reddit profile', '/api/v1/me/info/reddit'),
    get('Domains', '/api/v1/me/info/domains'),
    get('Blog posts', '/api/v1/data/blogs/list'),
    post('Base64 encode', '/api/v1/tools/base64/encode', '{"text":"hello"}'),
    post('Hash text', '/api/v1/tools/hash/sha256', '{"text":"hello"}'),
    get('Generate UUID', '/api/v1/tools/uuid/v4'),
    post('Decode JWT', '/api/v1/tools/jwt/decode', '{"token":"YOUR_JWT_TOKEN"}'),
    post('Generate QR code', '/api/v1/tools/qr/generate', '{"text":"https://example.com","type":"png"}'),
    post('Convert color', '/api/v1/tools/color/convert', '{"color":"#FF5733","from":"hex","to":"rgb"}'),
    get('Lorem ipsum', '/api/v1/tools/lorem/paragraphs/2'),
    get('Generate password', '/api/v1/tools/passwd/16'),
    get('Commit message', '/api/v1/tools/commit/text'),
    get('Public todos', '/api/v1/data/todos/public'),
    get('Anime quote', '/api/v1/fun/anime/quote'),
    get('Random joke', '/api/v1/fun/jokes/random'),
    get('Random fact', '/api/v1/fun/facts/random'),
    get('Trivia questions', '/api/v1/fun/trivia/questions?amount=10'),
    get('GitHub user', '/api/v1/social/github/user/octocat'),
    get('Reddit posts', '/api/v1/social/reddit/r/programming'),
    get('Social blog posts', '/api/v1/social/blogs/casjay/blog/posts'),
    get('Blog repository', '/api/v1/me/blog/repo/casjay/blog'),
    get('Disease data', '/api/v1/world/disease/outbreaks'),
    get('COVID-19 data', '/api/v1/world/covid'),
    get('School closings', '/api/v1/world/closings'),
    get('World timezones', '/api/v1/world/timezones')
  ],
  '/auth': [
    post('Sign in', '/api/v1/auth/login', '{"email":"user@example.com","password":"YOUR_PASSWORD"}'),
    post('Create account', '/api/v1/auth/signup', '{"name":"Your Name","email":"user@example.com","password":"YOUR_PASSWORD"}'),
    get('Current account', '/api/v1/auth/me', true),
    put('Update account', '/api/v1/auth/update', '{"name":"Your Name"}', true)
  ],
  '/data/blogs': [get('List blog posts', '/api/v1/data/blogs/list')],
  '/data/closings': [
    get('All closings', '/api/v1/world/closings'),
    get('Albany closings', '/api/v1/world/closings/albany'),
    get('Utica closings', '/api/v1/world/closings/utica'),
    get('Closings list', '/api/v1/world/closings/list')
  ],
  '/data/covid': [
    get('Global COVID data', '/api/v1/world/covid'),
    get('New York State data', '/api/v1/world/nys'),
    get('Disease data', '/api/v1/world/disease/covid-19/all')
  ],
  '/data/domains': [get('Domain list', '/api/v1/me/info/domains')],
  '/data/git': [
    get('GitHub profile', '/api/v1/me/info/github'),
    get('Repositories', '/api/v1/me/info/github/repos'),
    get('Organizations', '/api/v1/me/info/github/orgs')
  ],
  '/data/reddit': [
    get('My Reddit profile', '/api/v1/me/info/reddit'),
    get('User profile', '/api/v1/social/reddit/u/spez'),
    get('Subreddit posts', '/api/v1/social/reddit/r/programming')
  ],
  '/data/timezones': [
    get('All timezones', '/api/v1/world/timezones'),
    get('Search timezones', '/api/v1/world/timezones/search/Europe'),
    get('Timezone by country', '/api/v1/world/timezones/country/US')
  ],
  '/fun/anime': [
    get('Random quote', '/api/v1/fun/anime/quote'),
    get('Multiple quotes', '/api/v1/fun/anime/quotes/5')
  ],
  '/fun/facts': [
    get('Random fact', '/api/v1/fun/facts/random'),
    get('Science fact', '/api/v1/fun/facts/science'),
    get('Fact of the day', '/api/v1/fun/facts/daily')
  ],
  '/fun/jokes': [
    get('Random joke', '/api/v1/fun/jokes/random'),
    get('Programming joke', '/api/v1/fun/jokes/programming'),
    get('Dad joke', '/api/v1/fun/jokes/dad')
  ],
  '/fun/trivia': [
    get('Trivia questions', '/api/v1/fun/trivia/questions?category=science&difficulty=medium&amount=10'),
    get('Random question', '/api/v1/fun/trivia/random')
  ],
  '/personal/notes': [
    get('List notes', '/api/v1/data/notes/list', true),
    get('Search notes', '/api/v1/data/notes/search?q=example', true),
    post('Create note', '/api/v1/data/notes/create', '{"title":"Example note","content":"Note content"}', true),
    put('Update note', '/api/v1/data/notes/YOUR_NOTE_ID', '{"title":"Updated note","content":"Updated content"}', true),
    del('Delete note', '/api/v1/data/notes/YOUR_NOTE_ID', true)
  ],
  '/personal/profile': [
    get('Current account', '/api/v1/auth/me', true),
    get('API tokens', '/api/v1/auth/tokens', true),
    put('Update account', '/api/v1/auth/update', '{"name":"Your Name"}', true),
    get('Todos', '/api/v1/data/todos/list', true),
    get('Notes', '/api/v1/data/notes/list', true),
    get('Shortened URLs', '/api/v1/data/urls/list', true)
  ],
  '/personal/todos': [
    get('List todos', '/api/v1/data/todos/list', true),
    post('Create todo', '/api/v1/data/todos/create', '{"title":"Example task","description":"Task details"}', true),
    put('Update todo', '/api/v1/data/todos/YOUR_TODO_ID', '{"title":"Updated task"}', true),
    patch('Toggle todo', '/api/v1/data/todos/YOUR_TODO_ID/toggle', '{}', true),
    del('Delete todo', '/api/v1/data/todos/YOUR_TODO_ID', true)
  ],
  '/services/url': [
    post('Shorten a URL', '/api/v1/data/urls/shorten', '{"url":"https://example.com"}'),
    get('List your URLs', '/api/v1/data/urls/list', true),
    get('URL information', '/api/v1/data/urls/info/YOUR_CODE'),
    del('Delete a shortened URL', '/api/v1/data/urls/YOUR_CODE', true)
  ],
  '/social/blogs': [
    get('List blog posts', '/api/v1/me/blog/list'),
    get('Search blog posts', '/api/v1/me/blog/search?q=javascript'),
    get('Browse a blog repository', '/api/v1/me/blog/repo/casjay/blog')
  ],
  '/social/github': [
    get('GitHub user', '/api/v1/social/github/user/octocat'),
    get('User repositories', '/api/v1/social/github/repos/octocat'),
    get('Search repositories', '/api/v1/social/github/search/repos?q=javascript')
  ],
  '/social/reddit': [
    get('Hot subreddit posts', '/api/v1/social/reddit/r/javascript?sort=hot'),
    get('New subreddit posts', '/api/v1/social/reddit/r/javascript?sort=new'),
    get('Top subreddit posts', '/api/v1/social/reddit/r/javascript?sort=top'),
    get('Rising subreddit posts', '/api/v1/social/reddit/r/javascript?sort=rising'),
    get('Reddit user', '/api/v1/social/reddit/u/spez'),
    get('Trending posts', '/api/v1/social/reddit/r/all?sort=hot&limit=5')
  ],
  '/version': [get('Version and service status', '/api/v1/version')],
  '/tools/commit': [
    get('Generate a commit message', '/api/v1/tools/commit/text'),
    get('Generate a batch', '/api/v1/tools/commit/batch/10'),
    shell('Create a Git alias, then run git random-commit', `git config --global alias.random-commit '!f() { git commit -m "$(curl -q -LSsf {baseUrl}/api/v1/tools/commit/text)"; }; f'`),
    shell('Define this Bash function in your shell', `commit_random() {
  git commit -m "$(curl -q -LSsf '{baseUrl}/api/v1/tools/commit/text')" "$@"
}`)
  ],
  '/tools/cron': [
    get('Parse a cron expression', '/api/v1/tools/cron/parse?expression=0%209%20*%20*%201-5'),
    post('Validate a cron expression', '/api/v1/tools/cron/validate', '{"expression":"0 9 * * 1-5"}')
  ],
  '/tools/dictionary': [
    get('Define a word', '/api/v1/tools/dictionary/word/serendipity'),
    get('Find synonyms', '/api/v1/tools/dictionary/synonyms/happy'),
    get('Find antonyms', '/api/v1/tools/dictionary/antonyms/happy'),
    get('Find rhymes', '/api/v1/tools/dictionary/rhymes/time')
  ],
  '/tools/diff': [
    post('Compare lines', '/api/v1/tools/diff/lines', '{"text1":"before","text2":"after"}'),
    post('Compare words', '/api/v1/tools/diff/words', '{"text1":"before","text2":"after"}')
  ],
  '/tools/markdown': [
    post('Convert Markdown to HTML', '/api/v1/tools/markdown/to-html', '{"markdown":"# Hello"}'),
    post('Convert HTML to Markdown', '/api/v1/tools/markdown/to-markdown', '{"html":"<h1>Hello</h1>"}'),
    post('Preview Markdown', '/api/v1/tools/markdown/preview', '{"markdown":"# Hello"}')
  ],
  '/tools/regex': [
    post('Test a regular expression', '/api/v1/tools/regex/test', '{"pattern":"hello","text":"hello world"}'),
    post('Replace matches', '/api/v1/tools/regex/replace', '{"pattern":"world","text":"hello world","replacement":"there"}')
  ],
  '/utilities/base64': [
    post('Encode text', '/api/v1/tools/base64/encode', '{"text":"hello world"}'),
    post('Decode text', '/api/v1/tools/base64/decode', '{"text":"aGVsbG8gd29ybGQ="}')
  ],
  '/utilities/color': [
    post('Convert a color', '/api/v1/tools/color/convert', '{"color":"#336699","from":"hex","to":"rgb"}'),
    post('Generate a palette', '/api/v1/tools/color/palette', '{"baseColor":"#FF5733","count":5}')
  ],
  '/utilities/hash': [
    post('Generate an MD5 hash', '/api/v1/tools/hash/md5', '{"text":"hello world"}'),
    post('Generate a SHA-1 hash', '/api/v1/tools/hash/sha1', '{"text":"hello world"}'),
    post('Generate a hash', '/api/v1/tools/hash/sha256', '{"text":"hello world"}'),
    post('Generate a SHA-512 hash', '/api/v1/tools/hash/sha512', '{"text":"hello world"}'),
    post('Verify a hash', '/api/v1/tools/hash/sha256/verify', '{"text":"hello world","hash":"YOUR_SHA256_HASH"}')
  ],
  '/utilities/jwt': [post('Decode a JWT', '/api/v1/tools/jwt/decode', '{"token":"YOUR_JWT_TOKEN"}')],
  '/utilities/lorem': [
    get('Generate paragraphs', '/api/v1/tools/lorem/paragraphs/2'),
    get('Generate sentences', '/api/v1/tools/lorem/sentences/5'),
    get('Generate words', '/api/v1/tools/lorem/words/50')
  ],
  '/utilities/passwd': [
    get('Generate a password', '/api/v1/tools/passwd/16'),
    get('Generate a batch', '/api/v1/tools/passwd/batch/5/16'),
    post('Check password strength', '/api/v1/tools/passwd/check', '{"password":"YOUR_PASSWORD"}')
  ],
  '/utilities/qr': [
    post('Generate a QR code', '/api/v1/tools/qr/generate', '{"text":"https://example.com","type":"png"}'),
    post('Generate a text QR code', '/api/v1/tools/qr/generate/text', '{"text":"hello world"}')
  ],
  '/utilities/uuid': [
    get('Generate a UUID', '/api/v1/tools/uuid/v4'),
    get('Generate multiple UUIDs', '/api/v1/tools/uuid/generate/5'),
    get('Validate a UUID', '/api/v1/tools/uuid/validate/550e8400-e29b-41d4-a716-446655440000')
  ],
  '/world/arcgis': [get('ArcGIS data', '/api/v1/world/arcgis')],
  '/world/closings': [
    get('All closings', '/api/v1/world/closings'),
    get('Albany closings', '/api/v1/world/closings/albany'),
    get('Utica closings', '/api/v1/world/closings/utica'),
    get('Closings list', '/api/v1/world/closings/list')
  ],
  '/world/covid': [
    get('Global COVID data', '/api/v1/world/covid'),
    get('Disease data', '/api/v1/world/disease/covid-19/all')
  ],
  '/world/covid-global': [
    get('Global COVID data', '/api/v1/world/covid'),
    get('Disease data', '/api/v1/world/disease/covid-19/all')
  ],
  '/world/covid-usa': [
    get('USA COVID data', '/api/v1/world/disease/covid-19/countries/USA'),
    get('USA state data', '/api/v1/world/disease/covid-19/states')
  ],
  '/world/covid-nys': [
    get('New York COVID data', '/api/v1/world/nys'),
    get('County COVID data', '/api/v1/world/disease/covid-19/nyt/counties')
  ],
  '/world/disease': [
    get('Disease outbreaks', '/api/v1/world/disease/outbreaks'),
    get('Disease information', '/api/v1/world/disease/info/malaria'),
    get('Disease data by region', '/api/v1/world/disease/region/africa'),
    get('COVID summary', '/api/v1/world/disease/covid-19/all'),
    get('COVID country data', '/api/v1/world/disease/covid-19/countries?sort=cases')
  ],
  '/world/nys': [get('New York State data', '/api/v1/world/nys')],
  '/world/timezones': [
    get('All timezones', '/api/v1/world/timezones'),
    get('Search timezones', '/api/v1/world/timezones/search/Europe'),
    get('Timezone by country', '/api/v1/world/timezones/country/US')
  ],
  '/world/usa': [
    get('All USA states', '/api/v1/world/usa'),
    get('Data for a state', '/api/v1/world/usa/California')
  ]
};

function getPageApiExamples(pagePath) {
  if (/^\/data\/blogs\/[^/]+$/.test(pagePath)) {
    return [get('Get this blog post', `/api/v1/data/blogs/post/${encodeURIComponent(pagePath.split('/').pop())}`)];
  }

  return pageExamples[pagePath] || [];
}

module.exports = { getPageApiExamples };
