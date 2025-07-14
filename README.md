COMPANY: CODTECH IT SOLUTIONS

NAME: Priyank Dhanani

"INTERN ID: CT06DG396

*DOMAIN: PYTHON PROGRAMMING

*DURATION: 6 WEEEKS

"MENTOR*: NEELA SANTOSH KUMAR

# Student Report Card Generator

A web-based application for generating professional student report cards from Excel/CSV data files.

## About

This project was created to help educational institutions automate the process of generating student report cards. Instead of manually creating individual reports, teachers and administrators can upload a single Excel or CSV file containing all student data and generate professional PDF report cards for all students at once.

## Features

- **Web Interface**: Easy-to-use web application built with Flask
- **File Upload**: Support for Excel (.xlsx, .xls) and CSV files
- **Batch Processing**: Generate multiple report cards simultaneously
- **Professional Design**: Clean, standardized PDF report cards
- **Download Options**: Download individual reports or all reports as a ZIP file
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between dark and light themes
- **Real-time Progress**: Live progress tracking during report generation

## Technology Stack

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **PDF Generation**: ReportLab
- **Data Processing**: Pandas
- **Styling**: Bootstrap 5, Font Awesome

## Installation

1. **Download the project files**
   ```bash
   cd student-report-generator
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python server.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## Usage

### Step 1: Prepare Your Data File

Create an Excel or CSV file with the following columns:

**Student Information:**
- Name: Student's full name
- Father Name: Father's name
- Roll No: Student roll number
- Class: Student's class
- Section: Class section
- Session: Academic session (e.g., "2023-24")

**First Semester Subjects (1-6):**
- 1st_Subject_1 to 1st_Subject_6: Subject names
- 1st_Marks_1 to 1st_Marks_6: Obtained marks
- 1st_CR_1 to 1st_CR_6: Credit hours
- 1st_NG_1 to 1st_NG_6: Number grades
- 1st_GP_1 to 1st_GP_6: Grade points

**Second Semester Subjects (1-6):**
- 2nd_Subject_1 to 2nd_Subject_6: Subject names
- 2nd_Marks_1 to 2nd_Marks_6: Obtained marks
- 2nd_CR_1 to 2nd_CR_6: Credit hours
- 2nd_NG_1 to 2nd_NG_6: Number grades
- 2nd_GP_1 to 2nd_GP_6: Grade points

### Step 2: Upload and Generate

1. Open the web application in your browser
2. Click "Upload File" and select your data file
3. Wait for the file to be processed and validated
4. The system will automatically generate PDF report cards for all students
5. Download individual reports or all reports as a ZIP file

## File Structure

```
student-report-generator/
├── server.py                 # Main Flask application
├── report_generator.py       # PDF generation logic
├── requirements.txt          # Python dependencies
├── student_report.xlsx       # Sample data file
├── templates/               # HTML templates
│   ├── base.html
│   ├── index.html
│   └── reports.html
├── static/                  # Static files
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── app.js
├── uploads/                 # Temporary file uploads
└── generated_reports/       # Generated PDF reports
```

## Configuration

The application can be configured by modifying the following variables in `server.py`:

- `UPLOAD_FOLDER`: Directory for temporary file uploads
- `REPORTS_FOLDER`: Directory for generated reports
- `MAX_CONTENT_LENGTH`: Maximum file upload size (default: 16MB)
- `ALLOWED_EXTENSIONS`: Allowed file types for upload

## Security Features

- File type validation
- File size limits
- Secure filename handling
- Automatic cleanup of temporary files
- Input sanitization

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   pip install flask werkzeug pandas openpyxl reportlab
   ```

2. **Port already in use**
   - Change the port in `server.py`: `app.run(port=5001)`

3. **File upload errors**
   - Check file format (CSV, Excel)
   - Ensure file size is under 16MB
   - Verify all required columns are present

### Getting Help

If you encounter any issues:
1. Check that all dependencies are installed correctly
2. Verify your data file format matches the requirements
3. Check the console for error messages
4. Ensure you have sufficient disk space for generated reports

## Development

To run in development mode:

```bash
export FLASK_ENV=development
python server.py
```

## License

This project is for educational and institutional use. Feel free to modify and adapt it for your specific needs.

## Author

Created by Priyank for Priyank Training Academy.

## Version History

- v1.0 (December 2024): Initial release with web interface
- Basic PDF generation and file upload functionality
- Dark/light theme support
- Responsive design implementation
