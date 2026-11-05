# Vendor `@ncdai/wallet` (pinned)

**Pinned commit:** `ac36e649d58095dd7e4769541f60962da3dcd718`  
**Author date:** 2026-11-02 20:45:09 IST (2026-11-02T15:15:09Z)  
**Repository:** https://github.com/ncdai/chanhdai.com (cloned to `/tmp/chanhdai`)

## Steps used

1. `git clone https://github.com/ncdai/chanhdai.com /tmp/chanhdai`
2. `git -C /tmp/chanhdai checkout ac36e649d58095dd7e4769541f60962da3dcd718`
3. Copied `src/registry/components/wallet/wallet.tsx` to `src/components/wallet.tsx` (manual install path; byte-identical to registry JSON at the pin).

The live registry at https://chanhdai.com/r/wallet.json tracks `main` and cannot be pinned; this demo vendors the file from the commit above.

## Integrity

SHA-256 of `src/components/wallet.tsx`:

```
4e996428daacfaa7ce5331511c80bc42c969f086a7aad2f8729221f8dd818d94
```

No edits were made to the vendored component source.
