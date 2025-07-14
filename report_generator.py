# Student Report Card Generator
# Author: Priyank
# Created: December 2024
# Description: Generates PDF report cards from student data

import os
import pandas as pd
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime


def read_student_data(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".csv":
        df = pd.read_csv(file_path)
    elif ext in [".xls", ".xlsx"]:
        df = pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format. Please use CSV or Excel.")
    return df


def generate_student_report(df, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    for index, row in df.iterrows():
        name = str(row.get("Name", "Unknown")).strip()
        father_name = str(row.get("Father Name", "N/A")).strip()
        roll_no = str(row.get("Roll No", "N/A")).strip()
        student_class = str(row.get("Class", "N/A")).strip()
        section = str(row.get("Section", "N/A")).strip()
        session = str(row.get("Session", "N/A")).strip()

        filename = f"{name.replace(' ', '_')}_report_card.pdf"
        filepath = os.path.join(output_dir, filename)

        c = canvas.Canvas(filepath, pagesize=A4)
        width, height = A4

        # Header
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(colors.HexColor("#01356F"))
        c.drawCentredString(width / 2, height - 50, "Priyank Training Academy")
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.black)
        c.drawCentredString(width / 2, height - 65, "Complete Address of the school or college will be here")

        # Title
        c.setFillColor(colors.white)
        c.setStrokeColor(colors.HexColor("#01356F"))
        c.setLineWidth(1)
        c.rect(width / 2 - 100, height - 90, 200, 20, fill=1)
        c.setFillColor(colors.HexColor("#01356F"))
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(width / 2, height - 85, "Student Result Card")
        c.setFillColor(colors.black)

        y = height - 110
        c.setFont("Helvetica", 10)
        c.drawString(50, y, f"Student Name: {name}")
        c.drawString(300, y, f"Father Name: {father_name}")

        y -= 15
        c.drawString(50, y, f"Roll No.: {roll_no}")
        c.drawString(200, y, f"Class: {student_class}")
        c.drawString(320, y, f"Section: {section}")
        c.drawString(430, y, f"Session: {session}")

        def draw_semester_table(y_start, semester):
            subjects = []
            for i in range(1, 7):
                sub = row.get(f"{semester}_Subject_{i}", "")
                if sub:
                    subjects.append({
                        "title": sub,
                        "marks": row.get(f"{semester}_Marks_{i}", 0),
                        "cr": row.get(f"{semester}_CR_{i}", 0),
                        "ng": row.get(f"{semester}_NG_{i}", 0),
                        "gp": row.get(f"{semester}_GP_{i}", 0),
                    })

            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(width / 2, y_start, f"{semester} Semester")
            y = y_start - 20
            headers = ["Title", "Total Marks", "Obtain Marks", "CR Hrs", "NG", "GP", "GPA", "Remarks"]
            col_widths = [140, 70, 80, 50, 40, 40, 40, 60]
            x_positions = [50]
            for w in col_widths:
                x_positions.append(x_positions[-1] + w)

            row_height = 18
            c.setFont("Helvetica-Bold", 9)
            for i, header in enumerate(headers):
                c.rect(x_positions[i], y, col_widths[i], row_height, stroke=1, fill=0)
                c.drawCentredString(x_positions[i] + col_widths[i] / 2, y + 5, header)

            y -= row_height
            c.setFont("Helvetica", 9)
            total_marks = total_obtained = total_gp = 0

            for subject in subjects:
                for i in range(len(headers)):
                    c.rect(x_positions[i], y, col_widths[i], row_height)

                c.drawString(x_positions[0] + 2, y + 4, str(subject['title']))
                c.drawCentredString(x_positions[1] + col_widths[1] / 2, y + 4, "100")
                c.drawCentredString(x_positions[2] + col_widths[2] / 2, y + 4, str(subject['marks']))
                c.drawCentredString(x_positions[3] + col_widths[3] / 2, y + 4, str(subject['cr']))
                c.drawCentredString(x_positions[4] + col_widths[4] / 2, y + 4, str(subject['ng']))
                c.drawCentredString(x_positions[5] + col_widths[5] / 2, y + 4, str(subject['gp']))

                total_marks += 100
                total_obtained += int(subject['marks'])
                total_gp += float(subject['gp'])
                y -= row_height

            # Total row
            c.setFont("Helvetica-Bold", 9)
            for i in range(len(headers)):
                c.rect(x_positions[i], y, col_widths[i], row_height, stroke=1, fill=0)

            c.drawCentredString(x_positions[0] + col_widths[0] / 2, y + 4, "Total")
            c.drawCentredString(x_positions[1] + col_widths[1] / 2, y + 4, str(total_marks))
            c.drawCentredString(x_positions[2] + col_widths[2] / 2, y + 4, str(total_obtained))
            c.drawCentredString(x_positions[3] + col_widths[3] / 2, y + 4, "18")
            c.drawCentredString(x_positions[4] + col_widths[4] / 2, y + 4, "")
            c.drawCentredString(x_positions[5] + col_widths[5] / 2, y + 4, str(round(total_gp, 1)))
            gpa = round(total_gp / len(subjects), 2) if subjects else 0
            c.drawCentredString(x_positions[6] + col_widths[6] / 2, y + 4, str(gpa))
            c.drawCentredString(x_positions[7] + col_widths[7] / 2, y + 4, "Promoted")
            return y - row_height - 10

        y = draw_semester_table(height - 160, "1st")
        y = draw_semester_table(y, "2nd")

        # Footer
        c.setFont("Helvetica", 9)
        c.drawString(50, y, "Result Declaration Date: _____/_____/_______")
        c.drawString(300, y, "Obtain Marks: _______________")
        y -= 15
        c.drawString(50, y, "Prepared By: __________________________")
        c.drawString(300, y, "Percentage: _______________")
        y -= 15
        c.drawString(50, y, "Checked By: __________________________")
        c.drawString(300, y, "Signature of Controller of Exam")

        c.save()
        print(f"Saved: {filepath}")


if __name__ == "__main__":
    input_path = "student_report.xlsx"
    output_folder = "student_report_cards"

    try:
        student_df = read_student_data(input_path)
        generate_student_report(student_df, output_folder)
    except Exception as e:
        print("Error:", e)
