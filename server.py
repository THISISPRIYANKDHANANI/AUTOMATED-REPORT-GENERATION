# Student Report Card Generator Web Application
# Author: Priyank
# Created: December 2024
# Description: Flask web app for generating student report cards from Excel/CSV data

import os
import uuid
from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for, flash
from werkzeug.utils import secure_filename
import pandas as pd
from report_generator import read_student_data, generate_student_report
import zipfile
import shutil
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'priyank-report-generator-2024'

# App configuration
UPLOAD_FOLDER = 'uploads'
REPORTS_FOLDER = 'generated_reports'
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORTS_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['REPORTS_FOLDER'] = REPORTS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

def allowed_file(filename):
    """Check if uploaded file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Main page route"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and validation"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Create unique filename to avoid conflicts
            filename = secure_filename(file.filename)
            unique_id = str(uuid.uuid4())
            file_extension = filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{unique_id}.{file_extension}"
            
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(filepath)
            
            # Validate file by reading it
            try:
                df = read_student_data(filepath)
                student_count = len(df)
                
                return jsonify({
                    'success': True,
                    'file_id': unique_id,
                    'filename': filename,
                    'student_count': student_count,
                    'message': f'File uploaded successfully! Found {student_count} student(s).'
                })
            except Exception as e:
                # Clean up invalid file
                os.remove(filepath)
                return jsonify({'error': f'Invalid file format or data: {str(e)}'}), 400
        else:
            return jsonify({'error': 'Invalid file type. Please upload CSV or Excel files only.'}), 400
    
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/generate/<file_id>')
def generate_reports(file_id):
    """Generate PDF reports from uploaded data"""
    try:
        # Find the uploaded file
        uploaded_file = None
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            if filename.startswith(file_id):
                uploaded_file = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                break
        
        if not uploaded_file or not os.path.exists(uploaded_file):
            return jsonify({'error': 'File not found'}), 404
        
        # Create output directory
        output_dir = os.path.join(app.config['REPORTS_FOLDER'], file_id)
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate reports
        df = read_student_data(uploaded_file)
        generate_student_report(df, output_dir)
        
        # Count generated files
        generated_files = [f for f in os.listdir(output_dir) if f.endswith('.pdf')]
        
        return jsonify({
            'success': True,
            'file_id': file_id,
            'generated_count': len(generated_files),
            'message': f'Successfully generated {len(generated_files)} report(s)!'
        })
    
    except Exception as e:
        return jsonify({'error': f'Report generation failed: {str(e)}'}), 500

@app.route('/download/<file_id>')
def download_reports(file_id):
    """Download all reports as ZIP file"""
    try:
        reports_dir = os.path.join(app.config['REPORTS_FOLDER'], file_id)
        
        if not os.path.exists(reports_dir):
            return jsonify({'error': 'Reports not found'}), 404
        
        # Create ZIP file
        zip_filename = f"student_reports_{file_id}.zip"
        zip_path = os.path.join(app.config['REPORTS_FOLDER'], zip_filename)
        
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for filename in os.listdir(reports_dir):
                if filename.endswith('.pdf'):
                    file_path = os.path.join(reports_dir, filename)
                    zipf.write(file_path, filename)
        
        return send_file(zip_path, as_attachment=True, download_name=zip_filename)
    
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/reports/<file_id>')
def view_reports(file_id):
    """View list of generated reports"""
    try:
        reports_dir = os.path.join(app.config['REPORTS_FOLDER'], file_id)
        
        if not os.path.exists(reports_dir):
            return render_template('reports.html', error='Reports not found')
        
        # Get report list
        reports = []
        for filename in os.listdir(reports_dir):
            if filename.endswith('.pdf'):
                file_path = os.path.join(reports_dir, filename)
                file_size = os.path.getsize(file_path)
                reports.append({
                    'filename': filename,
                    'size': f"{file_size / 1024:.1f} KB"
                })
        
        return render_template('reports.html', reports=reports, file_id=file_id)
    
    except Exception as e:
        return render_template('reports.html', error=f'Error loading reports: {str(e)}')

@app.route('/download-single/<file_id>/<filename>')
def download_single_report(file_id, filename):
    """Download individual report file"""
    try:
        file_path = os.path.join(app.config['REPORTS_FOLDER'], file_id, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(file_path, as_attachment=True, download_name=filename)
    
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("Starting Student Report Generator...")
    print("Access the application at: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
