import { type AssetFieldsFragment } from './__generated__/Asset';

export type AssetERC20 = AssetFieldsFragment & {
  source: {
    __typename: 'ERC20';
    contractAddress: string;
    lifetimeLimit: string;
    withdrawThreshold: string;
    chainId: string;
  };
};

export type AssetBuiltin = AssetFieldsFragment & {
  source: { __typename: 'BuiltinAsset'; maxFaucetAmountMint: string };
};

export const WITHDRAW_THRESHOLD_TOOLTIP_TEXT =
  "The maximum you can withdraw instantly. There's no limit on the size of a withdrawal, but all withdrawals over the threshold will have a delay time added to them";

// List of defunct and no longer used assets that were created for various testnets
export const DENY_LIST: Record<string, string[]> = {
  TESTNET: [
    '07f8ce4e3df6c649f3fd794112f545ede9fbd9cfa76a9e380a7502a8d525e4db',
    '0b87ac58d4af7fc11c8b417153fcb62631cfd9643835ef28db3f5a1caef0b379',
    '169fd651dd1303fc6f3e1dee8349439140cf467a190bc9a04bff3e617509cfd4',
    '16ae5dbb1fd7aa2ddef725703bfe66b3647a4da7b844bfdd04e985756f53d9d6',
    '177e8f6c25a955bd18475084b99b2b1d37f28f3dec393fab7755a7e69c3d8c3b',
    '20ffe5b1f70364a6b976007d96d306345bc7b880256ddffbbea2c590096ef375',
    '2792b6ead78a812bd0169b2adbe9c2ea5b8c21510e40b93bf8d2cba6a0838e90',
    '27c0229ab9edc6a3ba6a3e9716c1b324d6515a3168004256879e2de7c240f453',
    '285923fed8c66ffb416b163e8ec72d3a87b9b8e2570e7ee7fe97d7092a918bc8',
    '2af02165ef5ea1d1284b4251117eaae45faa961ec918e3f69b66903a18822387',
    '2bf406160d06280d92412605eb397d08142736f4e17967e404dc892da278e9da',
    '373d90d97bd3f97f0c13cf449926cfd7f1ed5f3746c3091e8dd894d60bf5eac8',
    '3c7d6bd83dac3174923ba65f3af01f42858e267ca5b722fe2b0b3fec14e98ec2',
    '434b502cabb7a9a36d3036a599d589537da293d8bbab224692629351a7926249',
    '43bb50d6ba0a871088014cb204079ace4811970ce3d52b15896f6e7a88f900b7',
    '46e9d23142762db57751b1b507e15747fe9478de504cbc4a0bffd828c39e3776',
    '4b6957c6a184b002db80c7a4dd811d0e70866be4a4c8fffa4894e78aa132b407',
    '4cbe1ad4cf232fb2232176e3f440f6e6fdc3ba7b1d95a99cb69116b9e379eae8',
    '4e4e80abff30cab933b8c4ac6befc618372eb76b2cbddc337eff0b4a3a4d25b8',
    '51eed0c17e3287996ba6006ce56de2591550ebfad46631f3a0129886967420e1',
    '522e09779d984ae77b60036f4ecd80f0491f5f0c8cc386a0712b78a020ab62e6',
    '5c950d4cfe1aaf9174c4358ee5df03f7e6bc556eac06a012cf6c07db154e20c4',
    '5d8eb4e4e385b85c5c11f47111f315d5d201e04f4ef5e294763bf51036974b91',
    '5dd5c226e944b4c3df3e8dbbbc473e72fb134f4c5b82a1968cc3cf7c1b40fe9e',
    '638b4dbe4f3ce5b81546bef29108e8374a7293012c6189ca00f287f8c62a98a5',
    '644c3a6e258382542a108c4dca16fae93657b6ff40238b2bb55854a125316052',
    '71ea74ef1aa7582bcdd4ef843b3e79584ded4d16e692f3946cac4c9d61aed4f2',
    '72f051ea66686ae004086f1ad086866f720f25896319abf3427cae101a58d985',
    '827bbacde0dd5bfec857933dbbf642147f2afe6a9db0a543839b1b5239ca6786',
    '83f4970aa1aeab85d01d8a976cbfd0fb3afedf391e18197e8c94c4021b3dffa1',
    '84a20b554854c9af10ef84d308795dfae455834d1a207798292d66e19fd72c92',
    '84fff099818dc4f5319477f0812b4341565cfb32ccf735beede734e386b8108f',
    '85771250f0aa84727a1c01ba8926e59217ca13a7706ba03cf2ad95abbbc2e3bc',
    '8a246b15bf185065d3f41a710f3eea0fbbe8754a8464501cf4a6d253d69c6423',
    '8e5553ee4e95db51523640d1d03b00c8ab31dd69d787e169b0d958ef52e19a0a',
    '92747340d922e9cda5bde17c46af8b409e47d6342f3b9c8fb058a34c6206d373',
    '9b43c6791aebed5f7b38d91907539173aa278de88294b6422f3dd8282cd2c6e2',
    '9e0bb9bd7ea2ec51efcdc98b432b6f0b055b2ed7973cfac9b44899d6e6c5deab',
    'a0cf0835cb5af7bd03c56d12d846eed81c182eab36ea61c074961c115da9c8c4',
    'a26dc4f6dea91e80d42e4736da7fe3c42f6275df9c4dca48be3ef96850192242',
    'a4c945aea50ef321eabf8a3bcf0b8bb74288452c4638876ee4df5fb59be4a0ec',
    'ae28c1043e79bdb95cae0e9919d4436157d14b183e24ab4572793812f3d89222',
    'b0cf8be4e4d1d2ac5156c2298aa42edc7a74d25b7838d06e2279e94018a47f3f',
    'b6d11705cb456768ff8271074dd8adcd78bd042a27fc205e9b52f9f945f42ea1',
    'be478570584211521890fb65a41bded4d2bf29beb0b61ac3cc3b97f828a27b22',
    'befde6d78ea1c996ae1d959342730220e274992097aeeae00c908a971314e6ae',
    'bf5b9464d154ffeff57f05f90b223c1045f0754befd01a9a42c99382115e7833',
    'd2239a7c92bc5c72a959a73ccee7727ba0966f4d88a33d71dbbc26e3f171555d',
    'd3f9cf6e1711595b4588366a96b725fc039f72a8a28b2e4c1b630016dd2eed39',
    'd9a9ab00bb79ce7dca7f6329ab627dcea2e53e5c16b85bf4aa8c3980b76fad57',
    'dd73f7d1e721ef5cba95f454a3019521456c1b43b97084ad29e3e6509148d45d',
    'eb30d55e90e1f9e5c4727d6fa2a5a8cd36ab9ae9738eb8f3faf53e2bee4861ee',
    'ede4076aef07fd79502d14326c54ab3911558371baaf697a19d077f4f89de399',
    'f481abe5700c6940ca996adfa9d07c9d9f07a486a7ce9cdb2e6ee0fa6450fe31',
    'f7355ec52730c2e6ba02216da8501b4b6934cd363511e9d47ae5b97056d02703',
    'fdf0ec118d98393a7702cf72e46fc87ad680b152f64b2aac59e093ac2d688fbb',
  ],
};

// We need a record of USDT on mainnet as it needs special handling for
// deposits and approvals due to the contract not conforming exactly
// to ERC20
export const USDT_ID = {
  MAINNET: 'bf1e88d19db4b3ca0d1d5bdb73718a01686b18cf731ca26adedf3c8b83802bba',
} as const;
