from os import environ
from subprocess import check_output
from argparse import ArgumentParser
import json

projects = []
projects_e2e = []

main_apps = ['governance', 'explorer', 'trading']

# take input from the pipeline
parser = ArgumentParser()

# let's generate slug from bash spell for now
parser.add_argument('--branch-slug', help='slug of branch')
parser.add_argument('--github-ref', help='current github ref')
parser.add_argument('--event-name', help='name of event in CI')
args = parser.parse_args()

# run yarn affected command
affected = check_output(
    f'yarn nx print-affected --base={environ["NX_BASE"]} --head={environ["NX_HEAD"]} --select=projects'.split()).decode('utf-8')


# print useful information
print(">>>> debug")
print(f"NX_BASE: { environ['NX_BASE'] }")
print(f"NX_HEAD: { environ['NX_HEAD'] }")
print(f"Branch slug: {args.branch_slug}")
print(f"Current ref: {args.github_ref}")
print(">> Affected output")
print(affected)
print(">>>> eof debug")

# define affection actions -> add to projects arrays and generate preview link


def affect_app(app):
    print(f"{app} is affected")
    projects.append(app)

# check appearance in the affected string for main apps
for app in main_apps:
    if app in affected:
        affect_app(app)

# if non of main apps is affected - test all of them
if not projects:
    for app in main_apps:
        affect_app(app)

# generate e2e targets
projects_e2e = [f'{app}-e2e' for app in projects]

# remove trading-e2e because it doesn't exists any more (new target is: console-e2e)
if "trading-e2e" in projects_e2e:
    projects_e2e.remove("trading-e2e")

# now parse apps that are deployed from develop but don't have previews
if 'develop' in args.github_ref:
    for app in ['static', 'ui-toolkit']:
        if app in affected:
            projects.append(app)

# if ref is in format release/{env}-{app} then only {app} is deployed
if 'release' in args.github_ref:
    for app in main_apps:
        if f'{args.github_ref}'.endswith(app):
            projects = [app]
            projects_e2e = [f'{app}-e2e']


projects = json.dumps(projects)

projects_e2e = json.dumps(projects_e2e)

print(f'Projects: {projects}')
print(f'Projects E2E: {projects_e2e}')


lines_to_write = [
    f'PROJECTS={projects}',
    f'PROJECTS_E2E={projects_e2e}',
]
env_file = environ['GITHUB_ENV']
print(f'Line to add to GITHUB_ENV file: {env_file}')
print(lines_to_write)
with open(env_file, 'a') as _f:
    _f.write('\n'.join(lines_to_write))
