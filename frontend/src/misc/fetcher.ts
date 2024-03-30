export default async function fetcher<JSON = any>(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<JSON> {
    const res = await fetch(input, init)
    return res.json()
}

export async function fetcherWithCookie<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, {...init, credentials: "include"})
  return res.json()
}
