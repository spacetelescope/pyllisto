import click
from pynpm import YarnPackage
from flask import Flask, render_template, send_from_directory
import os
import shutil
import json


PKG = YarnPackage(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__), "..", "js", "package.json")))

BUILT_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__), "..", "js", "built"))

LIB_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__), "..", "js", "lib"))

STATIC_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__), "static"))

app = Flask(__name__)


@app.route('/built/<path:path>')
def static_built(path):
    return send_from_directory(BUILT_DIR, path)


@app.route('/')
def index():
    return send_from_directory(LIB_DIR, 'index.html')
    # return render_template('index.html')


@app.route('/fetch-data')
def fetch_notebook_data():
    with open('/Users/nearl/projects/pyllisto/js/examples/widget_code.json') as f:
        return json.dumps(json.load(f))


@click.command()
@click.argument('notebook')
@click.option('-r', '--rebuild', is_flag=True, help='Rebuild javascript files.')
def start(notebook, rebuild):
    # static_built = os.path.join(STATIC_DIR, 'built')
    # static_lib = os.path.join(STATIC_DIR, 'lib')
    #
    # if os.path.exists(static_built):
    #     shutil.rmtree(static_built)
    #
    # if os.path.exists(static_lib):
    #     shutil.rmtree(static_lib)
    #
    # shutil.copytree(BUILT_DIR, static_built)
    # shutil.copytree(LIB_DIR, static_lib)

    if rebuild:
        # Run NPM install
        PKG.install()

        # Run the build command
        PKG.run_script('build')

    # Start the flask http server
    app.run()
