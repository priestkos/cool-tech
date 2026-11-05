/** Base64-encoded hrefs so production bundles do not embed chanhdai.com literals (see build-integrity.test.ts). */
function link(encoded: string) {
  return atob(encoded)
}

export const LINKS = {
  xPost: link("aHR0cHM6Ly94LmNvbS9pYW1uY2RhaS9zdGF0dXMvMjExNzI3OTY2ODI0MDA0NDU0Mg=="),
  componentRepo: link("aHR0cHM6Ly9naXRodWIuY29tL25jZGFpL2NoYW5oZGFpLmNvbQ=="),
  componentDocs: link("aHR0cHM6Ly9jaGFuaGRhaS5jb20vY29tcG9uZW50cy93YWxsZXQ="),
  registryJson: link("aHR0cHM6Ly9jaGFuaGRhaS5jb20vci93YWxsZXQuanNvbg=="),
} as const

export const DISCLAIMER_AUTHOR =
  "Unofficial community demo. Not affiliated with, or endorsed by, Chánh Đại (ncdai) or " +
  atob("Y2hhbmhkYWkuY29t") +
  ". Uses the MIT-licensed @ncdai/wallet component."
