type TokenSet={accessToken:string;expiresAt:number;refreshToken?:string}
let current:TokenSet|null=null
export function setSession(tokens:TokenSet|null){current=tokens}
export async function getAccessToken(){
  if(!current)return null
  if(Date.now()/1000>=current.expiresAt-30)return null
  return current.accessToken
}
export function clearSession(){current=null}
