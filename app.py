from flask import Flask, render_template, jsonify
import pandas as pd
import numpy as np
import os

app = Flask(__name__)

# Configure Flask to handle NaN properly
app.config['RESTFUL_JSON'] = {'ensure_ascii': False}

# =========================
# PATHS (IMPORTANT)
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
STATIC_DIR = os.path.join(BASE_DIR, "static")  # Flask automatically serves /static

# Filenames (expected inside /data)
RESPONSES_FILE = "ALL_BATCHES_COMBINED_BALANCED.csv"
ARTIFICIAL_CNI_FILE = "dataset_with_artificial_cni.csv"
HUMAN_FILE = "datasetcomplet.csv"


def csv_path(filename: str) -> str:
    """Build an absolute path to a CSV inside the data folder."""
    return os.path.join(DATA_DIR, filename)


def load_data():
    """Load and merge the datasets"""
    try:
        print("=" * 50)
        print("Starting data load...")

        # Load responses - USE BALANCED VERSION (40% Yes / 60% No)
        responses_path = csv_path(RESPONSES_FILE)
        print(f"Loading {responses_path} ...")
        responses = pd.read_csv(responses_path)

        print(f"✓ Loaded {len(responses)} responses (balanced: 40% Yes, 60% No)")
        print(f"  Columns: {list(responses.columns)}")

        # Load CNI scores (human data with artificial CNI)
        cni_path = csv_path(ARTIFICIAL_CNI_FILE)
        print(f"Loading {cni_path} ...")
        cni = pd.read_csv(cni_path)

        print(f"✓ Loaded {len(cni)} CNI records")
        print(f"  Columns: {list(cni.columns)}")

        # Merge on participant_id (responses) and Subject (cni)
        print("Merging datasets...")
        cni = cni.rename(columns={'Subject': 'participant_id'})
        merged = pd.merge(responses, cni, on='participant_id', how='left')

        print(f"✓ Merged dataset has {len(merged)} rows")
        print(f"  Final columns: {list(merged.columns)}")
        print("=" * 50)

        return merged

    except FileNotFoundError as e:
        print(f"ERROR: CSV file not found - {e}")
        print("Expected CSV files inside:", DATA_DIR)
        print("  -", RESPONSES_FILE)
        print("  -", ARTIFICIAL_CNI_FILE)
        print("  -", HUMAN_FILE)
        return pd.DataFrame()

    except Exception as e:
        print(f"ERROR loading data: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()


# Load data at startup
data = load_data()

# Route for welcome page (NEW - now the default landing page)
@app.route('/')
def welcome():
    return render_template('welcome.html', page='welcome')

# Route for homepage (now /home instead of /)
@app.route('/home')
@app.route('/index')
def index():
    return render_template('index.html', page='home')

# Route for motivation page
@app.route('/motivation')
def motivation():
    return render_template('motivation.html', page='motivation')

# Route for objectives page
@app.route('/objectives')
def objectives():
    return render_template('objectives.html', page='objectives')

# Route for CONTEXT merged page
@app.route('/context')
def context():
    return render_template('context.html', page='context')

# Route for DATA AND METHODOLOGY merged page
@app.route('/data-methodology')
def data_methodology():
    return render_template('data-methodology.html', page='data-methodology')

# Route for RESULTS merged page
@app.route('/results')
def results():
    return render_template('results.html', page='results')

# Route for human dataset page (previously /data)
@app.route('/human-dataset')
def human_dataset():
    return render_template('human-dataset.html', page='human-dataset')

# Route for LLM profiles page
@app.route('/llm-profiles')
def llm_profiles():
    return render_template('llm-profiles.html', page='llm-profiles')

# Route for CNI analysis page (previously /cni)
@app.route('/cni-analysis')
def cni_analysis():
    return render_template('cni-analysis.html', page='cni-analysis')

# Route for visualizations page
@app.route('/visualizations')
def visualizations():
    return render_template('visualizations.html', page='visualizations')

# Route for artificial dataset page
@app.route('/artificial-dataset')
def artificial_dataset():
    return render_template('artificial-dataset.html', page='artificial-dataset')

# Route for findings page
@app.route('/findings')
def findings():
    return render_template('findings.html', page='findings')

# Route for about study page (NEW)
@app.route('/about-study')
def about_study():
    return render_template('about-study.html', page='about-study')

# API route to get all data (for visualizations)
@app.route('/api/data')
def get_all_data():
    """Get all data"""
    print("API /api/data called")

    if data is None or len(data) == 0:
        print("ERROR: No data available")
        return jsonify([]), 200

    print(f"Returning {len(data)} rows")
    data_clean = data.replace([np.nan, np.inf, -np.inf], None)
    return jsonify(data_clean.to_dict(orient='records'))


# API route to get human participants data
@app.route('/api/human-data')
def get_human_data():
    """Get human participants dataset"""
    try:
        human_path = csv_path(HUMAN_FILE)
        human_data = pd.read_csv(human_path)

        columns_needed = ['Subject', 'Gender', 'Open', 'Con', 'Extra', 'Agree', 'Neuro', 'C', 'N', 'I']
        human_subset = human_data[columns_needed]

        # JSON-safe
        human_subset = human_subset.replace([np.nan, np.inf, -np.inf], None)
        return jsonify(human_subset.to_dict(orient='records'))

    except Exception as e:
        print(f"Error loading human data: {e}")
        import traceback
        traceback.print_exc()
        return jsonify([]), 200


# API route to get artificial agents data
@app.route('/api/artificial-data')
def get_artificial_data():
    """Get artificial agents dataset with CNI values"""
    try:
        artificial_path = csv_path(ARTIFICIAL_CNI_FILE)
        artificial_data = pd.read_csv(artificial_path)

        columns_needed = [
            'Subject', 'Extra', 'Agree', 'Con', 'Neuro', 'Open',
            'C', 'N', 'I',  # Human CNI parameters
            'C_artificial', 'N_artificial', 'I_artificial'
        ]
        artificial_subset = artificial_data[columns_needed]

        # JSON-safe
        artificial_subset = artificial_subset.replace([np.nan, np.inf, -np.inf], None)
        return jsonify(artificial_subset.to_dict(orient='records'))

    except Exception as e:
        print(f"Error loading artificial data: {e}")
        import traceback
        traceback.print_exc()
        return jsonify([]), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)