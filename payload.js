const assert = require("assert")
const fs = require("fs")
const path = require("path")

const { ecsign, toRpcSig, keccakFromString } = require("ethereumjs-util")
const EthCrypto = require("eth-crypto")

const { SigningKey, BaseWallet } = require("ethers")

const handle = process.argv[2]
const base_url = process.argv[3] ?? "https://proof-service.nextnext.id"

if (typeof handle === "undefined") {
  console.log("handle missing")
  process.exit()
}

async function personalSign(message, privateKey) {
  const messageHash = keccakFromString(
    `\x19Ethereum Signed Message:\n${message.length}${message}`,
    256
  )
  const signature = ecsign(messageHash, privateKey)
  return Buffer.from(
    toRpcSig(signature.v, signature.r, signature.s).slice(2),
    "hex"
  )
}

async function checkWithEthers(hex, privateKey, sign_payload) {
  const wallet = new BaseWallet(new SigningKey(privateKey))
  const hex2 = await wallet.signMessage(sign_payload)
  assert(hex === hex2)
}

async function main() {
  const identity = EthCrypto.createIdentity()
  const public_key = `0x04${identity.publicKey}`
  console.log(`publicKey: ${public_key}`)

  const payload = await fetch(`${base_url}/v1/proof/payload`, {
    method: "POST",
    body: JSON.stringify({
      action: "create",
      platform: "twitter",
      identity: handle,
      public_key,
    }),
  }).then(v => v.json())
  console.log(payload)

  const message = Buffer.from(payload.sign_payload, "utf8")
  const secretKey = Buffer.from(identity.privateKey.slice(2), "hex")
  const signature = await personalSign(message, secretKey)
  const hex = `0x${signature.toString("hex")}`
  console.log()
  console.log(`Signature: ${hex}`)

  // check if the signature is correct with ethers.js (just in case)
  await checkWithEthers(hex, identity.privateKey, payload.sign_payload)

  const base64 = signature.toString("base64")
  console.log(`Signature(base64): ${base64}`)

  const tweet = payload.post_content.default
    .split("\n")
    .map(v => v.replace("%SIG_BASE64%", base64))
    .join("\n")

  console.log()
  console.log(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`
  )

  const cred = {
    base_url,
    signature: base64,
    uuid: payload.uuid,
    public_key,
    created_at: payload.created_at,
    handle,
    identity,
  }

  fs.writeFileSync(path.resolve(__dirname, "cred.txt"), JSON.stringify(cred))
  console.log()
  console.log(cred)
}

main()
