## NextID Verification Test

### 1. Clone the Repo

```bash
git clone https://github.com/ocrybit/nextid-test.git
cd next-id-test
yarn
```

### 2. Generate Tweet

```bash
node payload.js [twitter_handle]
```

### 3. Tweet

Paste the link `https://twitter.com/intent/tweet?text=[text]` from the previous step to the URL bar, and tweet it, then get the `status ID` of the tweet.

### 4. Verify

```bash
node proof.js [status_id]
```
