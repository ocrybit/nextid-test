const fs = require("fs")
const path = require("path")
const proof_location = process.argv[2]

if (typeof proof_location === "undefined") {
  console.log("proof_location missing")
  process.exit()
}

async function main() {
  const cred = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "cred.txt"), "utf8")
  )

  const obj = {
    action: "create",
    platform: "twitter",
    identity: cred.handle,
    public_key: cred.public_key,
    proof_location,
    extra: {
      signature: cred.signature,
    },
    uuid: cred.uuid,
    created_at: cred.created_at,
  }
  console.log(obj)

  const res = await fetch(`${cred.base_url}/v1/proof`, {
    method: "POST",
    body: JSON.stringify(obj),
  }).then(v => v.json())

  console.log(res)
}

main()
