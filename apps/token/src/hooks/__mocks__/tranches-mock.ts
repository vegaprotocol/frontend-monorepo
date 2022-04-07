import { Tranche } from "@vegaprotocol/smart-contracts-sdk";
import parseJSON from "date-fns/parseJSON";

import { BigNumber } from "../../lib/bignumber";

const json: Tranche[] = [
  {
    tranche_id: 1,
    tranche_start: parseJSON("2022-03-05T00:00:00.000Z"),
    tranche_end: parseJSON("2023-06-05T00:00:00.000Z"),
    total_added: new BigNumber("3505372.53445"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("3505372.53445"),
    deposits: [
      {
        amount: new BigNumber("187637.95"),
        user: "0xE6CacAE56Cca8dFdB7910b5A13578719D4E57DA0",
        tx: "0xc4491908e3347b05f2394ac7e1006f573fe8cbc490a57cd1dadad70785e95024",
      },
      {
        amount: new BigNumber("200000"),
        user: "0x93b478148FF792B00076B7EdC89Db1FdE7772079",
        tx: "0xcc8fba855a0d965044d4cc587701fe9ee9f5863852cede017382ffe02963d9b8",
      },
      {
        amount: new BigNumber("21666.5743"),
        user: "0xB523235B6c7C74DDB26b10E78bFb2d0Cb63Ae289",
        tx: "0x8cc5159f3d665dd33a2bdac6e990cf1b65dc18b6b5e37a07b37dd54495a8d33c",
      },
      {
        amount: new BigNumber("200000"),
        user: "0x7227e17101E6C70F4dAfC7DDB77BB7D83DdfC1C8",
        tx: "0x0cdef6868bd6b977362396fd06525e1e757e827659c5d75cd512db121947e6f7",
      },
      {
        amount: new BigNumber("137998.56"),
        user: "0x69eFc5642CfcCB1777bc663433640531F044D1F5",
        tx: "0xaa9b3b39836a69f760f5d1d2fdba44ad348b27c8f31eb094ad6f779b39d7949c",
      },
      {
        amount: new BigNumber("16249.93"),
        user: "0x006B59DD3bC838A74476c0F4a33C1565831dA0DD",
        tx: "0xda9bdc846300600c0d360edcaf4a5ed40fa2586ba7872f2bf68251a669adff0e",
      },
    ],
    withdrawals: [],
    users: [
      {
        address: "0xE6CacAE56Cca8dFdB7910b5A13578719D4E57DA0",
        deposits: [
          {
            amount: new BigNumber("187637.95"),
            user: "0xE6CacAE56Cca8dFdB7910b5A13578719D4E57DA0",
            tranche_id: 1,
            tx: "0xc4491908e3347b05f2394ac7e1006f573fe8cbc490a57cd1dadad70785e95024",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("187637.95"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("187637.95"),
      },
      {
        address: "0x1A71e3ED1996CAbB91bB043f880CE963D601707e",
        deposits: [
          {
            amount: new BigNumber("112323.67"),
            user: "0x1A71e3ED1996CAbB91bB043f880CE963D601707e",
            tranche_id: 1,
            tx: "0xaa378d2d0d4d7b964a675bb19f19c4f7401deec6ce66b1bd98ad5b812026e53e",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("112323.67"),
        withdrawn_tokens: "0",
        remaining_tokens: new BigNumber("112323.67"),
      },
    ],
  },
  {
    tranche_id: 2,
    tranche_start: parseJSON("2022-06-05T00:00:00.000Z"),
    tranche_end: parseJSON("2023-12-05T00:00:00.000Z"),
    total_added: new BigNumber("15464357.550320999700000001"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("15464357.550320999700000001"),
    deposits: [
      {
        amount: new BigNumber("1"),
        user: "0x7fff551249D223f723557a96a0e1a469C79cC934",
        tx: "0x55fa59d71aac37428a5804442c48da677a4426a4e92447919a8199520ce20f53",
      },
      {
        amount: new BigNumber("100000"),
        user: "0xe20D4d4fFb165e4b9926467d82d03c0e9ab66D89",
        tx: "0xabf2cc96c41c8b4f0cff8d8ff7448e241ff83e296a7b7dea79d9d9868f33b7ad",
      },
      {
        amount: new BigNumber("500000"),
        user: "0x5f01A497e4033E4812ba5D494bCBc2220cd510Ed",
        tx: "0xe3a1a74378a42eace12c21c24889d8b0da6a3736ca7987720e70f59886caa5a3",
      },
      {
        amount: new BigNumber("59228.95"),
        user: "0x1d20f66eF3889aa48Bb4Badbbf993dE965BDb029",
        tx: "0xf31eab593b86aac54f5fa9fe24bb26105ff52386be60bc24617dd362df7c6f15",
      },
      {
        amount: new BigNumber("206374.1211"),
        user: "0x1b979e8AE3BbbaF96Dd1bbbC0060b360A23f2EBE",
        tx: "0x2983daa9acf6da5fba0debc2aaaaf47389b92aea0de0c27b20809fb69a63ce69",
      },
      {
        amount: new BigNumber("200000"),
        user: "0xe45993F39183E148bC35BA02ba8C289111181c0f",
        tx: "0xbda7b70ab8ac629617e74daaaa5451b04d7830bc0da516e10d533efc2eef1530",
      },
    ],
    withdrawals: [
      {
        amount: new BigNumber("0"),
        user: "0x4527F5A12bbbbb7c88c5863F8AB9a708928Fe702",
        tx: "0xbaa8632cd162265ca46baaaad746ec3d283a474e344727854d962e057380a51",
      },
    ],
    users: [
      {
        address: "0x7fff551249D223f723557a96a0e1aCCCC79cC934",
        deposits: [
          {
            amount: new BigNumber("1"),
            user: "0x7fff551249D223f723557a96a0e1aCCCC79cC934",
            tranche_id: 2,
            tx: "0x55fa59d71aac37428a0000042c48da677a4426a4e92447919a8199520ce20f53",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("1"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("1"),
      },
      {
        address: "0xCc5CAFD3daA3bb2c1168521F35d1eBEB6cf7c051",
        deposits: [
          {
            amount: new BigNumber("200000"),
            user: "0xCc5CAFD3daA3bb2c1168521F35d1eBEB6cf7c051",
            tranche_id: 2,
            tx: "0x8168230eb08320a7a874ebeeea20f0def842b8059a2b05a036870e00ca624c88",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("200000"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("200000"),
      },
      {
        address: "0x9cd59376F896a5F2084232E386A65c17EEA4Fe9f",
        deposits: [
          {
            amount: new BigNumber("200000"),
            user: "0x9cd59376F896a5F2084232E386A65c17EEA4Fe9f",
            tranche_id: 2,
            tx: "0x2eb27449e08a245314faaaaf0d93fafc70733586495f18cf2fb69ef979459efd",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("200000"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("200000"),
      },
      {
        address: "0xe45993F39183E148bC35BA02ba8aaaa807981caa",
        deposits: [
          {
            amount: new BigNumber("200000"),
            user: "0xe45993F39183E148bC35BA02ba8aaaa07981caa",
            tranche_id: 2,
            tx: "0xbda7b70ab8ac629617e74d33575451b04d7830bc0da516e10d533efc2eef1530",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("200000"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("200000"),
      },
    ],
  },
  {
    tranche_id: 3,
    tranche_start: parseJSON("2021-11-05T00:00:00.000Z"),
    tranche_end: parseJSON("2023-05-05T00:00:00.000Z"),
    total_added: new BigNumber("14597706.0446472999"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("14445316.74229298796336861823365303"),
    deposits: [
      {
        amount: new BigNumber("129284.449"),
        user: "0x26100B2C8168Cb0A6c869a5698265086A3Dfeaaa",
        tx: "0xcc67a776a2e3b48864470aaa9e0940c1814663b4fde6df60c1a099a636dcae79",
      },
      {
        amount: new BigNumber("1151405.093"),
        user: "0x777Ec2e2beaB6a63c1E763D0dc4120AF60BEe39F",
        tx: "0x1237d45a40aacc5dff7f8f69e8a4c0536fd0460b915de576bd3f0fdf5892c0a4",
      },
      {
        amount: new BigNumber("1151073.595"),
        user: "0x5CD0Ec63687588817044794bF15d4e37991efAB3",
        tx: "0xb4eaca7d8abeaf7e1d9d28b1f1fa09fc1933af0e11bff4b0120dcef7d2dfc64d",
      },
      {
        amount: new BigNumber("54034.5"),
        user: "0xc01F2E57554Bb392384feCA6a54c8E3A3Ca94E42",
        tx: "0xf33289a2a73a65b132accdddd600a8d2c7556c2d80784d5f8d4eea1ecacf93cc",
      },
      {
        amount: new BigNumber("115049.22"),
        user: "0x01a8055A97b461b58ba8e37cd349721FeAe77A8D",
        tx: "0xf650c3599b24d01dfa1f3e19b22f870ff8ac8dfac529893f0b22d548c3535eda",
      },
    ],
    withdrawals: [
      {
        amount: new BigNumber("0"),
        user: "0x4Aa3c35F6CC2d507E5C18205ee57099A4C80B19b",
        tx: "0x1af894d1f9ce5ea79aa52d180fbff5f30b8b456e43b76ca5d7d73366e422ea37",
      },
    ],
    users: [
      {
        address: "0x26100B2C8168Cb0A6c869a5698265086A3DfeF98",
        deposits: [
          {
            amount: new BigNumber("129284.449"),
            user: "0x26100B2C8168Cb0A6c869a5698265086A3DfeF98",
            tranche_id: 3,
            tx: "0xcc67a776a2e3b48864470eff9e0940c1814663b4fde6df60c1a099a636dcae79",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("129284.449"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("129284.449"),
      },
      {
        address: "0xd4632B682228Db5f38E2283869AEe8c29ee6Eec8",
        deposits: [
          {
            amount: new BigNumber("44499.2"),
            user: "0xd4632B682228Db5f38E2283869AEe8c29ee6Eec8",
            tranche_id: 3,
            tx: "0x57019840d1ce05e0ef65c45801d6699e5eb1032bd8ad56493594d4866996ea82",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("44499.2"),
        withdrawn_tokens: "0",
        remaining_tokens: new BigNumber("44499.2"),
      },
      {
        address: "0xe2E6F37cb1f1980418012BF69f43910d6Bc73e73",
        deposits: [
          {
            amount: new BigNumber("66748.8"),
            user: "0xe2E6F37cb1f1980418012BF69f43910d6Bc73e73",
            tranche_id: 3,
            tx: "0xd257a3aacd5bdf86cbea0ed3db3697f55dff9092129db6baedacaf00b50af936",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("66748.8"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("66748.8"),
      },
      {
        address: "0xc01F2E57554Bb392384feCA6a54c8E3A3Ca94E42",
        deposits: [
          {
            amount: new BigNumber("54034.5"),
            user: "0xc01F2E57554Bb392384feCA6a54c8E3A3Ca94E42",
            tranche_id: 3,
            tx: "0xf33289a2a73a65b132accdddd600a8d2c7556c2d80784d5f8d4eea1ecacf93cc",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("54034.5"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("54034.5"),
      },
    ],
  },
  {
    tranche_id: 4,
    tranche_start: parseJSON("2021-10-05T00:00:00.000Z"),
    tranche_end: parseJSON("2023-04-05T00:00:00.000Z"),
    total_added: new BigNumber("5198082.8647159303"),
    total_removed: new BigNumber("12706.1452878164044708"),
    locked_amount: new BigNumber("4849328.20502099651595959714823613"),
    deposits: [
      {
        amount: new BigNumber("110499.5291"),
        user: "0xa8679b60612Fb2e19d68964326CA02dCe6a08D08",
        tx: "0x9d3432b818054796489848c415af5c523acb16c1540e5865010baf71964c03a7",
      },
      {
        amount: new BigNumber("331498.5873"),
        user: "0x39fEc2e2beaB6a63c1E763D0dc4120AF60BEe39F",
        tx: "0xdf5c6e44ef0763e785721802704e5fd186fa3964302a566899027447d0dda57b",
      },
      {
        amount: new BigNumber("27624.032275"),
        user: "0xF5Fb27b912D987B5b6e02A1B1BE0C1F0740E2c6f",
        tx: "0x1860d39ae3e9ad710da9e2a9bf9606eedc1b176fca673473d6854ea91ed8beb5",
      },
      {
        amount: new BigNumber("73666.3527333333"),
        user: "0x2895059cB5a492BEd58D1fB22713006EfaD465eA",
        tx: "0x260619e2129cc58ae03f6b4ecfc5a6eeab29b5998de69875accb3cb945beed04",
      },
    ],
    withdrawals: [
      {
        amount: new BigNumber("1290.014571009862016"),
        user: "0xBc934494675a6ceB639B9EfEe5b9C0f017D35a75",
        tx: "0x637c3648ce941a77e08e741f981806a5d56275db6d280f041902386ae8567d06",
      },
      {
        amount: new BigNumber("5197.621879605058623"),
        user: "0xafa64cCa337eFEE0AD827F6C2684e69275226e90",
        tx: "0xe8b8c1a38d3ae809dcaae54a11adeeba0f46be03924e91d8f251f3f2d48c3553",
      },
      {
        amount: new BigNumber("376.2625308599198808"),
        user: "0x1dD2718fd01d05C9F50Fce8Bb723A4C7483A1E15",
        tx: "0x78af737235f1123bb1c6a607a0b4b7a3c5ed6859a4e8912f45bb7c812724b1de",
      },
      {
        amount: new BigNumber("4162.301372742020875"),
        user: "0xBc934494675a6ceB639B9EfEe5b9C0f017D35a75",
        tx: "0x85c7d9979f0e3a3660dc5952732eaf9414f7c28a1c00a9a10f449843f91d85e0",
      },
      {
        amount: new BigNumber("1679.944933599543076"),
        user: "0x9058e12e2F32cB1cD4D3123359963D77786477FC",
        tx: "0xd92083f2e90e84cb70ef27ac410ed1144200c41b1714fb54d29f5f23ca086ecb",
      },
    ],
    users: [
      {
        address: "0xa8679b60612Fb2e19d68964326CA02dCe6a08D08",
        deposits: [
          {
            amount: new BigNumber("110499.5291"),
            user: "0xa8679b60612Fb2e19d68964326CA02dCe6a08D08",
            tranche_id: 4,
            tx: "0x9d3432b818054796489848c415af5c523acb16c1540e5865010baf71964c03a7",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("110499.5291"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("110499.5291"),
      },
      {
        address: "0x8767d65677Cabaa2050b764AEf40610f2f9796F5",
        deposits: [
          {
            amount: new BigNumber("1104995.291"),
            user: "0x8767d65677Cabaa2050b764AEf40610f2f9796F5",
            tranche_id: 4,
            tx: "0xc6298f52c173a837abd051ed810b01eb5731be307376b73df6e31b4de39d0122",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("1104995.291"),
        withdrawn_tokens: "0",
        remaining_tokens: new BigNumber("1104995.291"),
      },
      {
        address: "0x91715128a71c9C734CDC20E5EdaaeA02E72e422E",
        deposits: [
          {
            amount: new BigNumber("165749.29365"),
            user: "0x91715128a71c9C734CDC20E5EdEEeA02E72e422E",
            tranche_id: 4,
            tx: "0xf828cea685a0689f27446f02d3376c3afa4398182d3b5bf1c81e949f5965d1c1",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("165749.29365"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("165749.29365"),
      },
      {
        address: "0x2895059cB5a492BEd58D1fB22713006EfaD465eA",
        deposits: [
          {
            amount: new BigNumber("73666.3527333333"),
            user: "0x2895059cB5a492BEd58D1fB22713006EfaD465eA",
            tranche_id: 4,
            tx: "0x260619e2129cc58ae03f6b4ecfc5a6eeab29b5998de69875accb3cb945beed04",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("73666.3527333333"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("73666.3527333333"),
      },
    ],
  },
  {
    tranche_id: 23,
    tranche_start: parseJSON("2022-04-30T00:00:00.000Z"),
    tranche_end: parseJSON("2022-04-30T00:00:00.000Z"),
    total_added: new BigNumber("10833.29"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("10833.29"),
    deposits: [
      {
        amount: new BigNumber("10833.29"),
        user: "0xF3359E5B89f7804c8c9283781Aaaa33BBd979c9D",
        tx: "0x65f904ef34d6992b52f449a709d7a24411a501fd07f90aaa9255eacc994bc229",
      },
    ],
    withdrawals: [],
    users: [
      {
        address: "0xF3359E5B89f7804c8c9283781Aaaa33BBd979c9D",
        deposits: [
          {
            amount: new BigNumber("10833.29"),
            user: "0xF3359E5B89f7804c8c9283781Aaaa33BBd979c9D",
            tranche_id: 23,
            tx: "0x65f904ef34d6992b52f449a709d7a24411a501fd07f90aaa9255eacc994bc229",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("10833.29"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("10833.29"),
      },
    ],
  },
  {
    tranche_id: 24,
    tranche_start: parseJSON("2022-09-26T00:00:00.000Z"),
    tranche_end: parseJSON("2022-09-26T00:00:00.000Z"),
    total_added: new BigNumber("16249.93"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("16249.93"),
    deposits: [
      {
        amount: new BigNumber("16249.93"),
        user: "0xcE96670971ec2E1E79D0d96688adbA2FfD6F6C7f",
        tx: "0x3dbd991b7914986505d89a7c1562278dffffa2f5f444bdbf5d6bbd838e3d8d5d",
      },
    ],
    withdrawals: [],
    users: [
      {
        address: "0xcE96670971ec2E1E79D0d96688adbA2FfD6F6C7f",
        deposits: [
          {
            amount: new BigNumber("16249.93"),
            user: "0xcE96670971ec2E1E79D0d96688adbA2FfD6F6C7f",
            tranche_id: 24,
            tx: "0x3dbd991b7914986505d89a7c1562278dffffa2f5f444bdbf5d6bbd838e3d8d5d",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("16249.93"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("16249.93"),
      },
    ],
  },
  {
    tranche_id: 25,
    tranche_start: parseJSON("2022-02-10T00:00:00.000Z"),
    tranche_end: parseJSON("2023-04-05T00:00:00.000Z"),
    total_added: new BigNumber("0"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("0"),
    deposits: [],
    withdrawals: [],
    users: [],
  },
  {
    tranche_id: 26,
    tranche_start: parseJSON("2022-02-04T00:00:00.000Z"),
    tranche_end: parseJSON("2023-04-05T00:00:00.000Z"),
    total_added: new BigNumber("135173.4239508"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("135173.4239508"),
    deposits: [
      {
        amount: new BigNumber("135173.4239508"),
        user: "0xc90eA4d8D214D548221EE3622a8BE1D61f7077A2",
        tx: "0x123fb1e293a8246b92d85a47c8d33def9fb6468c7cbb70f1754d78914b12dbf8",
      },
    ],
    withdrawals: [],
    users: [
      {
        address: "0x222eA4d8D214D548221EE3622a8BE1D61f7077A2",
        deposits: [
          {
            amount: new BigNumber("135173.4239508"),
            user: "0x222eA4d8D214D548221EE3622a8BE1D61f7077A2",
            tranche_id: 26,
            tx: "0x9fafb1e293a8246b92d85a47c8d33def9fb6468c7cbb70f1754d78914b12dbf8",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("135173.4239508"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("135173.4239508"),
      },
    ],
  },
  {
    tranche_id: 27,
    tranche_start: parseJSON("2022-05-09T00:00:00.000Z"),
    tranche_end: parseJSON("2023-04-05T00:00:00.000Z"),
    total_added: new BigNumber("32499.86"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("32499.86"),
    deposits: [
      {
        amount: new BigNumber("32499.86"),
        user: "0x1E7c4E57A1dc4dD4bBE81b833e3E437f69619DaB",
        tx: "0x25a3dd4852ce8ac1c15fe42123cfab14e4bf8a5c1cb97167cb4d6fe20bd319ae",
      },
    ],
    withdrawals: [],
    users: [
      {
        address: "0x3E7c4E57A1dc4dD4bBE81bbEFBe3Eaaaf69619Da9",
        deposits: [
          {
            amount: new BigNumber("32499.86"),
            user: "0x3E7c4E57A1dc4dD4bBE81bbEFBe3Eaaaf69619Da9",
            tranche_id: 27,
            tx: "0x75a3dd4852ce8ac1c15fe42ff6cfab1455bf8a5c1cb97167cb4d6fe20bd319ae",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("32499.86"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("32499.86"),
      },
    ],
  },
  {
    tranche_id: 28,
    tranche_start: parseJSON("2022-04-30T00:00:00.000Z"),
    tranche_end: parseJSON("2023-04-05T00:00:00.000Z"),
    total_added: new BigNumber("10833.29"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("10833.29"),
    deposits: [
      {
        amount: new BigNumber("10833.29"),
        user: "0xF3359E5B89f7804c8c9283781Aaa133BBd979c9D",
        tx: "0x166d235eff44e7bcc63597c0d6e698552e4440fe90ec7cf07a1d510c275cf3e0",
      },
    ],
    withdrawals: [],
    users: [
      {
        address: "0x12349E5B89f7804c8c9283781A23133BBd979c22",
        deposits: [
          {
            amount: new BigNumber("10833.29"),
            user: "0x12349E5B89f7804c8c9283781A23133BBd979c22",
            tranche_id: 28,
            tx: "0x166d235eff44e7baa6359712345698552e6150fe90ec7cf07a1d510c275cf3e0",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("10833.29"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("10833.29"),
      },
    ],
  },
  {
    tranche_id: 29,
    tranche_start: parseJSON("2022-09-26T00:00:00.000Z"),
    tranche_end: parseJSON("2023-04-05T00:00:00.000Z"),
    total_added: new BigNumber("16249.93"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("16249.93"),
    deposits: [
      {
        amount: new BigNumber("16249.93"),
        user: "0xcE96670971ec2E1E79D0d12388adbA2FfD6F6C7f",
        tx: "0xa770ab2d05e6c81be46b73ac2326e81a111da4ce55a2d8544bd95b48ad530674",
      },
    ],
    withdrawals: [],
    users: [
      {
        address: "0xcE96670971ec2E1E79D0d96688adbA2FfD6F6C7f",
        deposits: [
          {
            amount: new BigNumber("16249.93"),
            user: "0xcE96670971ec212379D0d12388adbA2Ffc6F6C7f",
            tranche_id: 29,
            tx: "0xa220ab2d05e6c81be12373ac2326e81a912da4ce55a2d8544bd95b48ad530674",
          },
        ],
        withdrawals: [],
        total_tokens: new BigNumber("16249.93"),
        withdrawn_tokens: new BigNumber("0"),
        remaining_tokens: new BigNumber("16249.93"),
      },
    ],
  },
  {
    tranche_id: 30,
    tranche_start: parseJSON("2021-11-01T00:00:00.000Z"),
    tranche_end: parseJSON("2022-05-01T00:00:00.000Z"),
    total_added: new BigNumber("0"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("0"),
    deposits: [],
    withdrawals: [],
    users: [],
  },
  {
    tranche_id: 31,
    tranche_start: parseJSON("2022-02-01T00:00:00.000Z"),
    tranche_end: parseJSON("2022-08-01T00:00:00.000Z"),
    total_added: new BigNumber("0"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("0"),
    deposits: [],
    withdrawals: [],
    users: [],
  },
  {
    tranche_id: 32,
    tranche_start: parseJSON("2022-05-01T00:00:00.000Z"),
    tranche_end: parseJSON("2022-11-01T00:00:00.000Z"),
    total_added: new BigNumber("0"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("0"),
    deposits: [],
    withdrawals: [],
    users: [],
  },
  {
    tranche_id: 33,
    tranche_start: parseJSON("2022-11-01T00:00:00.000Z"),
    tranche_end: parseJSON("2023-05-01T00:00:00.000Z"),
    total_added: new BigNumber("0"),
    total_removed: new BigNumber("0"),
    locked_amount: new BigNumber("0"),
    deposits: [],
    withdrawals: [],
    users: [],
  },
];

export default json;
