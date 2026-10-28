export type EditorLanguage = "js" | "ts" | "css" | "json"

export type Sample = {
  id: string
  label: string
  code: string
}

export const SAMPLES: Record<EditorLanguage, Sample[]> = {
  js: [
    {
      id: "js-messy-fn",
      label: "Messy function",
      code: `function greet(name){return "hello "+name+"!"}`,
    },
    {
      id: "js-imports",
      label: "Scattered imports",
      code: `import {b,a} from "./lib";import z from "zod";\nconst x=1,y=2;console.log(x,y,b,a,z)`,
    },
    {
      id: "js-object",
      label: "Compact object",
      code: `export default {foo:1,bar:[1,2,3],nested:{a:1,b:2}}`,
    },
  ],
  ts: [
    {
      id: "ts-types",
      label: "Inline types",
      code: `type User={id:number;name:string};const u:User={id:1,name:"Ada"}`,
    },
    {
      id: "ts-arrow",
      label: "Arrow chain",
      code: `const sum=(a:number,b:number)=>a+b;const nums=[1,2,3].map(n=>sum(n,1)).filter(n=>n>2)`,
    },
    {
      id: "ts-interface",
      label: "Interface blob",
      code: `interface Config{debug:boolean;port:number;tags:string[]};const cfg:Config={debug:true,port:3000,tags:["fmt","bun"]}`,
    },
  ],
  css: [
    {
      id: "css-compact",
      label: "Compact rules",
      code: `.card{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid #ccc}.card h1{margin:0;font-size:1.25rem}`,
    },
    {
      id: "css-media",
      label: "Media query",
      code: `@media (max-width:640px){.grid{grid-template-columns:1fr}}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}`,
    },
    {
      id: "css-vars",
      label: "Variables",
      code: `:root{--accent:#f5a623;--bg:#111}.btn{background:var(--accent);color:var(--bg);border-radius:4px;padding:.5rem 1rem}`,
    },
  ],
  json: [
    {
      id: "json-compact",
      label: "Compact object",
      code: `{"name":"bun-fmt","version":"1.0.0","tags":["demo","fmt"],"meta":{"ok":true}}`,
    },
    {
      id: "json-array",
      label: "Nested arrays",
      code: `{"items":[{"id":1,"qty":2},{"id":2,"qty":5}],"totals":[7,12]}`,
    },
    {
      id: "json-flat",
      label: "Flat keys",
      code: `{"a":1,"b":2,"c":3,"d":4,"e":5}`,
    },
  ],
}
