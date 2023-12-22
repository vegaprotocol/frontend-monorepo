from argparse import ArgumentParser
from os import environ

# take input from the pipeline
parser = ArgumentParser()

# let's generate slug from bash spell for now
parser.add_argument('--github-ref', help='current github ref')
parser.add_argument('--app', help='current app')
args = parser.parse_args()

env_name = ''
domain = 'vega.rocks'
bucket_name = ''

if 'release/' in args.github_ref:
  if 'mainnet-mirror' in args.github_ref:
    env_name = 'mainnet-mirror'
  if 'validators-testnet' in args.github_ref or 'validators-testnet' in args.github_ref:
    env_name = 'validators-testnet'
  else:
    # remove prefixing release/ and take the first string limited by - which is supposed to be name of the environment for releasing (format: release/testnet-trading)
    env_name = args.github_ref.replace('refs/heads/release/', '').split('-')[0]
elif 'develop' in args.github_ref:
  env_name = 'stagnet1'
  apps_deployed_from_develop_to_mainnet = {
    'multisig-signer' :'tools.vega.xyz',
    'static': 'static.vega.xyz',
    'ui-toolkit' : 'ui.vega.rocks',
  }
  if args.app in apps_deployed_from_develop_to_mainnet:
    env_name = 'mainnet'
    bucket_name = apps_deployed_from_develop_to_mainnet[args.app]
# endswith to avoid confusion with mirror env
elif args.github_ref.endswith('mainnet'):
  env_name = 'mainnet'


other_domains_to_deploy = {
  'mainnet': 'vega.xyz',
  'testnet': 'fairground.wtf',
}

if env_name in other_domains_to_deploy:
  domain = other_domains_to_deploy[env_name]
  if not bucket_name:
    bucket_name = f'{args.app}.{domain}'

# testing envs on vega.rocks contain env_name in the url not like testnet / mainnet
if not bucket_name:
  bucket_name = f'{args.app}.{env_name}.{domain}'

print(f'env name: {env_name}')
print(f'domain: {domain}')
print(f'bucket name: {bucket_name}')

lines_to_write = [
  f'ENV_NAME={env_name}',
  f'BUCKET_NAME={bucket_name}',
]

env_file = environ['GITHUB_ENV']
print(f'Line to add to GITHUB_ENV file: {env_file}')
print(lines_to_write)
with open(env_file, 'a') as _f:
  _f.write('\n'.join(lines_to_write))
