---
name: Release
about: A template to outline the steps needed to for a successful release of our frontend apps
title: 'Release [add dapp version]-core-[add core version]'
labels:
assignees: ''
---

### Tasks

- [ ] Review [link to core release](xxx) 
- [ ] Tag frontend-monorepo
- [ ] Create release and generate release notes
- [ ] Run `@smoke` tests
- [ ] Run `@regression` tests
- [ ] Run `@slow` tests
- [ ] Explorative testing of key flows
- [ ] Set `release/[network]` to tagged commit
- [ ] Verify builds (on Netlify and Fleek) are successful
- [ ] Verify build has been deployed
- [ ] Smoke testing on deployed app
