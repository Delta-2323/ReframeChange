import os
import json
import smtplib
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone

from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from supabase import create_client
from openai import OpenAI

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

openai_client = OpenAI(
    base_url=os.environ.get("AI_INTEGRATIONS_OPENAI_BASE_URL", "http://localhost:1106/modelfarm/openai"),
    api_key=os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY", "placeholder"),
)


REM16_MAP = {
    "Proof-Eager-Rockstar": {
        "name": "The Champion Analyst",
        "description": "You champion change with evidence. You energetically communicate data-driven rationale and inspire others through logical arguments. Your role is to validate and promote the change with credibility.",
        "thinkingWeights": {"Proof": 0.7, "Process": 0.15, "People": 0.05, "Possibilities": 0.1},
    },
    "Proof-Eager-Roadie": {
        "name": "The Quiet Validator",
        "description": "You support change by quietly gathering and sharing evidence behind the scenes. You build confidence in others through thorough research without seeking the spotlight yourself.",
        "thinkingWeights": {"Proof": 0.65, "Process": 0.2, "People": 0.1, "Possibilities": 0.05},
    },
    "Proof-Cautious-Rockstar": {
        "name": "The Sceptic",
        "description": "You ask the hard questions publicly. You need solid evidence before committing, and your visible scrutiny ensures that the change is rigorous and well-founded. Others look to you to catch flaws.",
        "thinkingWeights": {"Proof": 0.6, "Process": 0.2, "People": 0.05, "Possibilities": 0.15},
    },
    "Proof-Cautious-Roadie": {
        "name": "The Silent Doubter",
        "description": "You have reservations about the change but express them quietly through careful questioning in small groups. You need data and reassurance before you can fully commit to supporting the change.",
        "thinkingWeights": {"Proof": 0.6, "Process": 0.15, "People": 0.15, "Possibilities": 0.1},
    },
    "Process-Eager-Rockstar": {
        "name": "The Systems Builder",
        "description": "You champion change through structure. You visibly lead the implementation of plans, processes, and governance frameworks, ensuring the change is delivered in an organised and reliable way.",
        "thinkingWeights": {"Proof": 0.15, "Process": 0.7, "People": 0.05, "Possibilities": 0.1},
    },
    "Process-Eager-Roadie": {
        "name": "The Reliable Executor",
        "description": "You support change by diligently following and completing processes. You are the backbone of implementation — reliable, thorough, and consistent in delivering on your commitments.",
        "thinkingWeights": {"Proof": 0.1, "Process": 0.7, "People": 0.1, "Possibilities": 0.1},
    },
    "Process-Cautious-Rockstar": {
        "name": "The Risk Manager",
        "description": "You are a visible advocate for careful, risk-aware change. You raise concerns about process gaps and implementation risks publicly, helping the team avoid costly mistakes.",
        "thinkingWeights": {"Proof": 0.2, "Process": 0.6, "People": 0.1, "Possibilities": 0.1},
    },
    "Process-Cautious-Roadie": {
        "name": "The Resistant Follower",
        "description": "You follow instructions but have serious concerns about whether the change has been properly planned. You need clear processes and assurances before you can fully engage with the change.",
        "thinkingWeights": {"Proof": 0.15, "Process": 0.6, "People": 0.15, "Possibilities": 0.1},
    },
    "People-Eager-Rockstar": {
        "name": "The Energiser",
        "description": "You bring emotional energy and enthusiasm to change. You visibly rally people, build morale, and create a sense of community and belonging around the change journey.",
        "thinkingWeights": {"Proof": 0.05, "Process": 0.1, "People": 0.7, "Possibilities": 0.15},
    },
    "People-Eager-Roadie": {
        "name": "The Quiet Connector",
        "description": "You support change by nurturing relationships behind the scenes. You listen, support, and connect people informally, helping teams feel safe and supported through the transition.",
        "thinkingWeights": {"Proof": 0.05, "Process": 0.1, "People": 0.7, "Possibilities": 0.15},
    },
    "People-Cautious-Rockstar": {
        "name": "The Protector",
        "description": "You visibly advocate for the wellbeing of your team during change. You are cautious about impacts on people and ensure that the human cost of change is recognised and addressed.",
        "thinkingWeights": {"Proof": 0.1, "Process": 0.15, "People": 0.6, "Possibilities": 0.15},
    },
    "People-Cautious-Roadie": {
        "name": "The Concerned Observer",
        "description": "You are deeply worried about how the change will affect people, but you express these concerns quietly. You need reassurance that people's wellbeing is being looked after before you can engage.",
        "thinkingWeights": {"Proof": 0.1, "Process": 0.15, "People": 0.65, "Possibilities": 0.1},
    },
    "Possibility-Eager-Rockstar": {
        "name": "The Creator",
        "description": "You are the visionary champion of change. You see exciting possibilities and actively promote a bold new future, inspiring others with your creativity and enthusiasm for what could be.",
        "thinkingWeights": {"Proof": 0.05, "Process": 0.1, "People": 0.15, "Possibilities": 0.7},
    },
    "Possibility-Eager-Roadie": {
        "name": "The Dreamer",
        "description": "You are inspired by the possibilities of change and support it enthusiastically behind the scenes. You generate ideas and creative solutions, though you prefer others to take the visible lead.",
        "thinkingWeights": {"Proof": 0.1, "Process": 0.05, "People": 0.15, "Possibilities": 0.7},
    },
    "Possibility-Cautious-Rockstar": {
        "name": "The Critic",
        "description": "You see the potential in change but are openly critical of how it is being executed. You challenge assumptions publicly and push for more creative and ambitious approaches to the change vision.",
        "thinkingWeights": {"Proof": 0.15, "Process": 0.1, "People": 0.1, "Possibilities": 0.65},
    },
    "Possibility-Cautious-Roadie": {
        "name": "The Hesitant Innovator",
        "description": "You are drawn to the possibilities of change but hold back due to uncertainty or past disappointments. You need to see the vision articulated more clearly before you can fully commit your creative energy.",
        "thinkingWeights": {"Proof": 0.15, "Process": 0.15, "People": 0.1, "Possibilities": 0.6},
    },
}

ALL_MODEL_NAMES = [v["name"] for v in REM16_MAP.values()]


def get_mental_model(thinking_focus, orientation, change_role):
    key = f"{thinking_focus}-{orientation}-{change_role}"
    return REM16_MAP.get(key, {
        "name": "Unknown Model",
        "description": "We could not determine your mental model from the provided inputs.",
    })


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def safe_get(d, key, default=None):
    return d.get(key, default) if d else default


def get_project_columns():
    base = ["id", "name", "bcip_canvas", "change_logic", "change_strategy",
            "manager_name", "document_name", "document_mime_type", "document_data",
            "created_at", "updated_at"]
    extra = ["status", "communication_plan", "stakeholder_impact",
             "start_date", "go_live_date", "communication_start_date", "assessment_end_date",
             "bcip_doc_name", "bcip_doc_path", "logic_doc_name", "logic_doc_path",
             "strategy_doc_name", "strategy_doc_path", "comm_plan_doc_name", "comm_plan_doc_path",
             "impact_doc_name", "impact_doc_path"]
    return base, extra


def project_to_camel(p):
    if not p:
        return None
    return {
        "id": p.get("id"),
        "name": p.get("name"),
        "status": p.get("status", "active"),
        "bcipCanvas": p.get("bcip_canvas"),
        "changeLogic": p.get("change_logic"),
        "changeStrategy": p.get("change_strategy"),
        "communicationPlan": p.get("communication_plan"),
        "stakeholderImpact": p.get("stakeholder_impact"),
        "managerName": p.get("manager_name"),
        "documentName": p.get("document_name"),
        "documentMimeType": p.get("document_mime_type"),
        "bcipDocName": p.get("bcip_doc_name"),
        "bcipDocPath": p.get("bcip_doc_path"),
        "logicDocName": p.get("logic_doc_name"),
        "logicDocPath": p.get("logic_doc_path"),
        "strategyDocName": p.get("strategy_doc_name"),
        "strategyDocPath": p.get("strategy_doc_path"),
        "commPlanDocName": p.get("comm_plan_doc_name"),
        "commPlanDocPath": p.get("comm_plan_doc_path"),
        "impactDocName": p.get("impact_doc_name"),
        "impactDocPath": p.get("impact_doc_path"),
        "startDate": p.get("start_date"),
        "goLiveDate": p.get("go_live_date"),
        "communicationStartDate": p.get("communication_start_date"),
        "assessmentEndDate": p.get("assessment_end_date"),
        "createdAt": p.get("created_at"),
        "updatedAt": p.get("updated_at"),
    }


def survey_to_camel(s):
    if not s:
        return None
    return {
        "id": s.get("id"),
        "stakeholderName": s.get("stakeholder_name"),
        "stakeholderEmail": s.get("stakeholder_email"),
        "role": s.get("role"),
        "department": s.get("department"),
        "thinkingFocus": s.get("thinking_focus"),
        "orientation": s.get("orientation"),
        "changeRole": s.get("change_role"),
        "mentalModel": s.get("mental_model"),
        "mentalModelDescription": s.get("mental_model_description"),
        "surveyFrequency": s.get("survey_frequency"),
        "projectId": s.get("project_id"),
        "createdAt": s.get("created_at"),
    }


def message_to_camel(m):
    if not m:
        return None
    return {
        "id": m.get("id"),
        "surveyId": m.get("survey_id"),
        "projectId": m.get("project_id"),
        "stakeholderName": m.get("stakeholder_name"),
        "mentalModel": m.get("mental_model"),
        "generatedContent": m.get("generated_content"),
        "editedContent": m.get("edited_content"),
        "status": m.get("status"),
        "createdAt": m.get("created_at"),
        "updatedAt": m.get("updated_at"),
    }


def concern_to_camel(c):
    if not c:
        return None
    return {
        "id": c.get("id"),
        "surveyId": c.get("survey_id"),
        "projectId": c.get("project_id"),
        "stakeholderName": c.get("stakeholder_name"),
        "concernText": c.get("concern_text"),
        "assignedToSmeEmail": c.get("assigned_to_sme_email"),
        "assignedToSmeName": c.get("assigned_to_sme_name"),
        "smeResponse": c.get("sme_response"),
        "managerResponse": c.get("manager_response"),
        "status": c.get("status"),
        "createdAt": c.get("created_at"),
        "updatedAt": c.get("updated_at"),
    }


@app.route("/api/healthz")
def healthz():
    return jsonify({"status": "ok", "server": "python-flask"})


@app.route("/api/projects", methods=["POST"])
def create_project():
    try:
        body = request.get_json(force=True)
        row = {
            "name": body.get("name", "Untitled"),
            "bcip_canvas": body.get("bcipCanvas") or None,
            "change_logic": body.get("changeLogic") or None,
            "change_strategy": body.get("changeStrategy") or None,
            "manager_name": body.get("managerName") or None,
        }
        if body.get("communicationPlan"):
            row["communication_plan"] = body["communicationPlan"]
        if body.get("stakeholderImpact"):
            row["stakeholder_impact"] = body["stakeholderImpact"]
        if body.get("startDate"):
            row["start_date"] = body["startDate"]
        if body.get("goLiveDate"):
            row["go_live_date"] = body["goLiveDate"]
        if body.get("communicationStartDate"):
            row["communication_start_date"] = body["communicationStartDate"]
        if body.get("assessmentEndDate"):
            row["assessment_end_date"] = body["assessmentEndDate"]

        result = supabase.table("projects").insert(row).execute()
        project = result.data[0] if result.data else None
        return jsonify(project_to_camel(project)), 201
    except Exception as e:
        print(f"Error creating project: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/api/projects", methods=["GET"])
def list_projects():
    try:
        result = supabase.table("projects").select("*").order("created_at").execute()
        projects = [project_to_camel(p) for p in (result.data or [])]
        return jsonify({"projects": projects})
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    try:
        result = supabase.table("projects").select("*").eq("id", project_id).single().execute()
        return jsonify(project_to_camel(result.data))
    except Exception as e:
        print(f"Error fetching project: {e}")
        return jsonify({"error": str(e)}), 404


@app.route("/api/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    try:
        body = request.get_json(force=True)
        row = {
            "name": body.get("name"),
            "bcip_canvas": body.get("bcipCanvas") or None,
            "change_logic": body.get("changeLogic") or None,
            "change_strategy": body.get("changeStrategy") or None,
            "manager_name": body.get("managerName") or None,
            "updated_at": now_iso(),
        }
        if "communicationPlan" in body:
            row["communication_plan"] = body["communicationPlan"] or None
        if "stakeholderImpact" in body:
            row["stakeholder_impact"] = body["stakeholderImpact"] or None
        if "startDate" in body:
            row["start_date"] = body["startDate"] or None
        if "goLiveDate" in body:
            row["go_live_date"] = body["goLiveDate"] or None
        if "communicationStartDate" in body:
            row["communication_start_date"] = body["communicationStartDate"] or None
        if "assessmentEndDate" in body:
            row["assessment_end_date"] = body["assessmentEndDate"] or None

        try:
            result = supabase.table("projects").update(row).eq("id", project_id).execute()
        except Exception as update_err:
            err_msg = str(update_err)
            if "column" in err_msg and "schema cache" in err_msg:
                optional_cols = [
                    "start_date", "go_live_date", "communication_start_date",
                    "assessment_end_date", "communication_plan", "stakeholder_impact",
                    "status",
                ]
                for col in optional_cols:
                    row.pop(col, None)
                result = supabase.table("projects").update(row).eq("id", project_id).execute()
            else:
                raise update_err
        project = result.data[0] if result.data else None
        if not project:
            return jsonify({"error": "Project not found"}), 404
        return jsonify(project_to_camel(project))
    except Exception as e:
        print(f"Error updating project: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/api/projects/<int:project_id>/status", methods=["PATCH"])
def toggle_project_status(project_id):
    try:
        body = request.get_json(force=True)
        status = body.get("status", "active")
        result = supabase.table("projects").update({
            "status": status,
            "updated_at": now_iso(),
        }).eq("id", project_id).execute()
        project = result.data[0] if result.data else None
        if not project:
            return jsonify({"error": "Project not found"}), 404
        return jsonify(project_to_camel(project))
    except Exception as e:
        print(f"Error toggling status: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/api/projects/<int:project_id>/document", methods=["POST"])
def upload_document(project_id):
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        f = request.files["file"]
        doc_data = base64.b64encode(f.read()).decode("utf-8")
        result = supabase.table("projects").update({
            "document_name": f.filename,
            "document_mime_type": f.content_type,
            "document_data": doc_data,
            "updated_at": now_iso(),
        }).eq("id", project_id).execute()
        project = result.data[0] if result.data else None
        if not project:
            return jsonify({"error": "Project not found"}), 404
        return jsonify(project_to_camel(project))
    except Exception as e:
        print(f"Error uploading document: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects/<int:project_id>/document", methods=["GET"])
def download_document(project_id):
    try:
        result = supabase.table("projects").select("document_name, document_mime_type, document_data").eq("id", project_id).single().execute()
        p = result.data
        if not p or not p.get("document_data") or not p.get("document_name"):
            return jsonify({"error": "No document attached"}), 404
        data = base64.b64decode(p["document_data"])
        return Response(
            data,
            mimetype=p.get("document_mime_type", "application/octet-stream"),
            headers={"Content-Disposition": f'attachment; filename="{p["document_name"]}"'},
        )
    except Exception as e:
        print(f"Error downloading document: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects/<int:project_id>/document", methods=["DELETE"])
def delete_document(project_id):
    try:
        result = supabase.table("projects").update({
            "document_name": None,
            "document_mime_type": None,
            "document_data": None,
            "updated_at": now_iso(),
        }).eq("id", project_id).execute()
        project = result.data[0] if result.data else None
        if not project:
            return jsonify({"error": "Project not found"}), 404
        return jsonify(project_to_camel(project))
    except Exception as e:
        print(f"Error deleting document: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects/<int:project_id>/field-document", methods=["POST"])
def upload_field_document(project_id):
    try:
        field = request.form.get("field")
        valid_fields = ["bcip", "logic", "strategy", "comm_plan", "impact"]
        if field not in valid_fields:
            return jsonify({"error": f"Invalid field. Must be one of: {valid_fields}"}), 400
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        f = request.files["file"]
        file_path = f"{project_id}/{int(datetime.now().timestamp() * 1000)}_{f.filename}"
        file_bytes = f.read()

        supabase.storage.from_("project-documents").upload(file_path, file_bytes, {"content-type": f.content_type or "application/octet-stream"})

        update_data = {
            f"{field}_doc_name": f.filename,
            f"{field}_doc_path": file_path,
            "updated_at": now_iso(),
        }
        result = supabase.table("projects").update(update_data).eq("id", project_id).execute()
        project = result.data[0] if result.data else None
        return jsonify(project_to_camel(project))
    except Exception as e:
        print(f"Error uploading field document: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects/<int:project_id>/field-document/<field>", methods=["GET"])
def download_field_document(project_id, field):
    try:
        result = supabase.table("projects").select("*").eq("id", project_id).single().execute()
        p = result.data
        doc_path = p.get(f"{field}_doc_path") if p else None
        if not doc_path:
            return jsonify({"error": "No field document found"}), 404
        data = supabase.storage.from_("project-documents").download(doc_path)
        doc_name = p.get(f"{field}_doc_name", "document")
        return Response(
            data,
            mimetype="application/octet-stream",
            headers={"Content-Disposition": f'attachment; filename="{doc_name}"'},
        )
    except Exception as e:
        print(f"Error downloading field document: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects/<int:project_id>/field-document/<field>", methods=["DELETE"])
def delete_field_document(project_id, field):
    try:
        result = supabase.table("projects").select("*").eq("id", project_id).single().execute()
        p = result.data
        doc_path = p.get(f"{field}_doc_path") if p else None
        if doc_path:
            try:
                supabase.storage.from_("project-documents").remove([doc_path])
            except Exception:
                pass

        update_data = {
            f"{field}_doc_name": None,
            f"{field}_doc_path": None,
            "updated_at": now_iso(),
        }
        supabase.table("projects").update(update_data).eq("id", project_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        print(f"Error deleting field document: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/surveys", methods=["POST"])
def submit_survey():
    try:
        body = request.get_json(force=True)
        thinking_focus = body.get("thinkingFocus")
        orientation = body.get("orientation")
        change_role = body.get("changeRole")

        model_data = get_mental_model(thinking_focus, orientation, change_role)

        row = {
            "stakeholder_name": body.get("stakeholderName"),
            "stakeholder_email": body.get("stakeholderEmail"),
            "role": body.get("role"),
            "thinking_focus": thinking_focus,
            "orientation": orientation,
            "change_role": change_role,
            "mental_model": model_data["name"],
            "mental_model_description": model_data["description"],
            "project_id": body.get("projectId"),
        }
        if body.get("department"):
            row["department"] = body["department"]
        if body.get("surveyFrequency"):
            row["survey_frequency"] = body["surveyFrequency"]

        try:
            result = supabase.table("surveys").insert(row).execute()
        except Exception as insert_err:
            err_msg = str(insert_err)
            if "column" in err_msg and "schema cache" in err_msg:
                row.pop("department", None)
                row.pop("survey_frequency", None)
                result = supabase.table("surveys").insert(row).execute()
            else:
                raise insert_err
        survey = result.data[0] if result.data else None
        return jsonify(survey_to_camel(survey)), 201
    except Exception as e:
        print(f"Error submitting survey: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/api/surveys", methods=["GET"])
def list_surveys():
    try:
        project_id = request.args.get("projectId")
        q = supabase.table("surveys").select("*").order("created_at")
        if project_id:
            q = q.eq("project_id", int(project_id))
        result = q.execute()
        surveys = [survey_to_camel(s) for s in (result.data or [])]
        return jsonify({"surveys": surveys})
    except Exception as e:
        print(f"Error fetching surveys: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/surveys/<int:survey_id>", methods=["GET"])
def get_survey(survey_id):
    try:
        result = supabase.table("surveys").select("*").eq("id", survey_id).single().execute()
        return jsonify(survey_to_camel(result.data))
    except Exception as e:
        print(f"Error fetching survey: {e}")
        return jsonify({"error": str(e)}), 404


@app.route("/api/messages", methods=["GET"])
def list_messages():
    try:
        project_id = request.args.get("projectId")
        q = supabase.table("ai_messages").select("*").order("created_at", desc=True)
        if project_id:
            q = q.eq("project_id", int(project_id))
        result = q.execute()
        messages = [message_to_camel(m) for m in (result.data or [])]
        return jsonify({"messages": messages})
    except Exception as e:
        print(f"Error fetching messages: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/messages/<int:message_id>", methods=["GET"])
def get_message(message_id):
    try:
        result = supabase.table("ai_messages").select("*").eq("id", message_id).single().execute()
        return jsonify(message_to_camel(result.data))
    except Exception as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/messages/<int:message_id>", methods=["PUT"])
def update_message(message_id):
    try:
        body = request.get_json(force=True)
        update_data = {"updated_at": now_iso()}
        if "editedContent" in body:
            update_data["edited_content"] = body["editedContent"]
        if "status" in body:
            update_data["status"] = body["status"]

        result = supabase.table("ai_messages").update(update_data).eq("id", message_id).execute()
        msg = result.data[0] if result.data else None
        if not msg:
            return jsonify({"error": "Message not found"}), 404
        return jsonify(message_to_camel(msg))
    except Exception as e:
        print(f"Error updating message: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/api/messages", methods=["POST"])
def generate_message():
    try:
        body = request.get_json(force=True)
        survey_id = body.get("surveyId")
        project_id = body.get("projectId")

        if not survey_id or not project_id:
            return jsonify({"error": "surveyId and projectId are required"}), 400

        survey_result = supabase.table("surveys").select("*").eq("id", survey_id).single().execute()
        survey = survey_result.data
        if not survey:
            return jsonify({"error": "Survey not found"}), 404

        project_result = supabase.table("projects").select("*").eq("id", project_id).single().execute()
        project = project_result.data
        if not project:
            return jsonify({"error": "Project not found"}), 404

        project_context_parts = []
        if project.get("bcip_canvas"):
            project_context_parts.append(f"BCIP Canvas:\n{project['bcip_canvas']}")
        if project.get("change_logic"):
            project_context_parts.append(f"Change Logic:\n{project['change_logic']}")
        if project.get("change_strategy"):
            project_context_parts.append(f"Change Strategy:\n{project['change_strategy']}")
        if project.get("communication_plan"):
            project_context_parts.append(f"Communication Plan:\n{project['communication_plan']}")
        if project.get("stakeholder_impact"):
            project_context_parts.append(f"Stakeholder Impact:\n{project['stakeholder_impact']}")
        project_context = "\n\n".join(project_context_parts)

        system_prompt = "You are a change management specialist expert in the REM16™ framework and psychological safety. Your task is to craft tailored, empathetic communication messages for stakeholders based on their mental model archetype. Messages must be psychologically safe, respectful, and actionable."

        user_prompt = f"""Please write a tailored change management communication message for the following stakeholder:

Stakeholder Name: {survey['stakeholder_name']}
Role: {survey['role']}
Mental Model Archetype: {survey['mental_model']}
Mental Model Description: {survey['mental_model_description']}

Project: {project['name']}

{f"Project Context:\n{project_context}" if project_context else ""}

Requirements:
- Address the stakeholder by name
- Acknowledge their specific thinking style and change orientation ({survey['mental_model']})
- Use language and framing that resonates with their mental model archetype
- Be psychologically safe: acknowledge concerns, validate their perspective, build trust
- Explain what the change means for them specifically
- Give clear, actionable next steps
- Keep it professional but warm
- Length: 200-350 words

Write the message now:"""

        response = openai_client.chat.completions.create(
            model="gpt-5.2",
            max_completion_tokens=8192,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        generated_content = response.choices[0].message.content or "Unable to generate message at this time."

        insert_result = supabase.table("ai_messages").insert({
            "survey_id": survey_id,
            "project_id": project_id,
            "stakeholder_name": survey["stakeholder_name"],
            "mental_model": survey["mental_model"],
            "generated_content": generated_content,
            "edited_content": None,
            "status": "draft",
        }).execute()

        msg = insert_result.data[0] if insert_result.data else None
        return jsonify(message_to_camel(msg)), 201
    except Exception as e:
        print(f"Error generating message: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/messages/<int:message_id>/send-email", methods=["POST"])
def send_email_message(message_id):
    try:
        body = request.get_json(force=True)
        subject = body.get("subject")
        if not subject:
            return jsonify({"error": "subject is required"}), 400

        msg_result = supabase.table("ai_messages").select("*").eq("id", message_id).single().execute()
        msg = msg_result.data
        if not msg:
            return jsonify({"error": "Message not found"}), 404

        survey_result = supabase.table("surveys").select("*").eq("id", msg["survey_id"]).single().execute()
        survey = survey_result.data
        if not survey:
            return jsonify({"error": "Survey not found"}), 404

        email_addr = survey.get("stakeholder_email")
        if not email_addr or email_addr == "unknown@example.com":
            return jsonify({"error": "Stakeholder does not have a valid email address"}), 400

        content = msg.get("edited_content") or msg.get("generated_content", "")

        gmail_user = os.environ.get("GMAIL_FROM_EMAIL")
        gmail_pass = os.environ.get("GMAIL_APP_PASSWORD")
        if not gmail_user or not gmail_pass:
            return jsonify({"error": "Gmail credentials not configured. Set GMAIL_FROM_EMAIL and GMAIL_APP_PASSWORD."}), 500

        escaped = content.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
            <div style="background: #0f2044; padding: 28px 32px; border-radius: 12px 12px 0 0;">
                <p style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px;">Reframe Change · REM16™ Framework</p>
            </div>
            <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
                <p style="white-space: pre-wrap; line-height: 1.7; font-size: 15px; color: #374151;">{escaped}</p>
            </div>
        </div>
        """

        email_msg = MIMEMultipart("alternative")
        email_msg["From"] = f'"Reframe Change" <{gmail_user}>'
        email_msg["To"] = email_addr
        email_msg["Subject"] = subject
        email_msg.attach(MIMEText(content, "plain"))
        email_msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_user, gmail_pass)
            server.send_message(email_msg)

        supabase.table("ai_messages").update({
            "status": "sent",
            "updated_at": now_iso(),
        }).eq("id", message_id).execute()

        return jsonify({"success": True, "message": f"Email sent to {email_addr}"})
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    try:
        surveys_result = supabase.table("surveys").select("*").execute()
        all_surveys = surveys_result.data or []

        projects_count = supabase.table("projects").select("*", count="exact").execute()
        messages_count = supabase.table("ai_messages").select("*", count="exact").execute()
        approved_count = supabase.table("ai_messages").select("*", count="exact").eq("status", "approved").execute()

        concerns_total = 0
        concerns_open = 0
        try:
            cc = supabase.table("concerns").select("*", count="exact").execute()
            oc = supabase.table("concerns").select("*", count="exact").in_("status", ["open", "assigned"]).execute()
            concerns_total = cc.count or 0
            concerns_open = oc.count or 0
        except Exception:
            pass

        model_map = {}
        focus_map = {}
        orient_map = {}
        for s in all_surveys:
            mm = s.get("mental_model", "Unknown")
            model_map[mm] = model_map.get(mm, 0) + 1
            tf = s.get("thinking_focus", "Unknown")
            focus_map[tf] = focus_map.get(tf, 0) + 1
            o = s.get("orientation", "Unknown")
            orient_map[o] = orient_map.get(o, 0) + 1

        return jsonify({
            "totalSurveys": len(all_surveys),
            "totalProjects": projects_count.count or 0,
            "totalMessages": messages_count.count or 0,
            "approvedMessages": approved_count.count or 0,
            "totalConcerns": concerns_total,
            "openConcerns": concerns_open,
            "mentalModelDistribution": [
                {"mentalModel": k, "count": v}
                for k, v in sorted(model_map.items(), key=lambda x: -x[1])
            ],
            "focusAreaDistribution": [
                {"area": k, "count": v}
                for k, v in sorted(focus_map.items(), key=lambda x: -x[1])
            ],
            "orientationDistribution": [
                {"orientation": k, "count": v}
                for k, v in sorted(orient_map.items(), key=lambda x: -x[1])
            ],
        })
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/dashboard/rm16-analytics", methods=["GET"])
def rm16_analytics():
    try:
        surveys_result = supabase.table("surveys").select("*").execute()
        all_surveys = surveys_result.data or []
        total = len(all_surveys)

        name_to_key = {v["name"]: k for k, v in REM16_MAP.items()}
        model_counts = {v["name"]: 0 for v in REM16_MAP.values()}
        for s in all_surveys:
            mm = s.get("mental_model", "")
            if mm in model_counts:
                model_counts[mm] += 1

        recognized_total = sum(model_counts.values())
        model_distribution = []
        for entry in REM16_MAP.values():
            name = entry["name"]
            count = model_counts.get(name, 0)
            pct = round((count / recognized_total) * 100, 1) if recognized_total > 0 else 0.0
            model_distribution.append({"model": name, "count": count, "percentage": pct})
        model_distribution.sort(key=lambda x: -x["count"])

        thinking_totals = {"Proof": 0.0, "Process": 0.0, "People": 0.0, "Possibilities": 0.0}
        for s in all_surveys:
            mm = s.get("mental_model", "")
            key = name_to_key.get(mm)
            if key and key in REM16_MAP:
                weights = REM16_MAP[key].get("thinkingWeights", {})
                for dim in thinking_totals:
                    thinking_totals[dim] += weights.get(dim, 0)

        if total > 0:
            for dim in thinking_totals:
                thinking_totals[dim] = round(thinking_totals[dim], 2)

        return jsonify({
            "totalRespondents": total,
            "modelDistribution": model_distribution,
            "thinkingStyles": thinking_totals,
        })
    except Exception as e:
        print(f"Error fetching RM16 analytics: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/dashboard/ai-summary", methods=["POST"])
def ai_summary():
    try:
        body = request.get_json(force=True) or {}
        project_id = body.get("projectId")

        surveys_result = supabase.table("surveys").select("*").execute()
        all_surveys = surveys_result.data or []
        projects_count = supabase.table("projects").select("*", count="exact").execute()
        messages_count = supabase.table("ai_messages").select("*", count="exact").execute()
        approved_count = supabase.table("ai_messages").select("*", count="exact").eq("status", "approved").execute()

        dist_map = {}
        tf_map = {}
        orient_map = {}
        role_map = {}
        for s in all_surveys:
            mm = s.get("mental_model", "Unknown")
            dist_map[mm] = dist_map.get(mm, 0) + 1
            tf = s.get("thinking_focus", "Unknown")
            tf_map[tf] = tf_map.get(tf, 0) + 1
            o = s.get("orientation", "Unknown")
            orient_map[o] = orient_map.get(o, 0) + 1
            cr = s.get("change_role", "Unknown")
            role_map[cr] = role_map.get(cr, 0) + 1

        project_context = ""
        if project_id:
            try:
                pr = supabase.table("projects").select("*").eq("id", project_id).single().execute()
                if pr.data:
                    p = pr.data
                    project_context = f"\nProject Focus: {p['name']}"
                    if p.get("bcip_canvas"):
                        project_context += f"\nBCIP Canvas: {p['bcip_canvas'][:400]}"
                    if p.get("change_logic"):
                        project_context += f"\nChange Logic: {p['change_logic'][:400]}"
                    if p.get("change_strategy"):
                        project_context += f"\nChange Strategy: {p['change_strategy'][:400]}"
            except Exception:
                pass

        if not all_surveys:
            return jsonify({
                "summary": "No stakeholder surveys have been completed yet. Complete some surveys to generate a meaningful analysis.",
                "keyInsights": ["No survey data available yet."],
                "recommendations": ["Share the stakeholder survey link with your team to begin collecting data."],
                "riskFlags": [],
                "generatedAt": now_iso(),
            })

        dist_text = ", ".join(f"{k}: {v}" for k, v in dist_map.items())
        tf_text = ", ".join(f"{k}: {v}" for k, v in tf_map.items())
        orient_text = ", ".join(f"{k}: {v}" for k, v in orient_map.items())
        role_text = ", ".join(f"{k}: {v}" for k, v in role_map.items())

        prompt = f"""You are an expert organisational change management consultant specialising in the REM16™ framework. Analyse the following stakeholder data and produce a strategic summary for the change manager.

STAKEHOLDER DATA:
- Total stakeholders surveyed: {len(all_surveys)}
- Active projects: {projects_count.count or 0}
- AI messages generated: {messages_count.count or 0} ({approved_count.count or 0} approved)
- Mental model distribution: {dist_text}
- Thinking focus breakdown: {tf_text}
- Orientation (Eager vs Cautious): {orient_text}
- Change role (Rockstar vs Roadie): {role_text}
{project_context}

Based on this data, provide a strategic analysis in JSON format with exactly these fields:
{{
  "summary": "A 3-4 sentence executive summary of the overall change readiness and stakeholder landscape",
  "keyInsights": ["3-5 specific insights about the stakeholder group derived from the mental model data"],
  "recommendations": ["3-5 concrete, actionable recommendations for the change manager"],
  "riskFlags": ["1-4 specific risk factors or watch-outs, or empty array if no risks"]
}}

Respond only with valid JSON."""

        response = openai_client.chat.completions.create(
            model="gpt-5.2",
            max_completion_tokens=8192,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content or "{}"
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = {}

        return jsonify({
            "summary": parsed.get("summary", "Unable to generate summary."),
            "keyInsights": parsed.get("keyInsights", []),
            "recommendations": parsed.get("recommendations", []),
            "riskFlags": parsed.get("riskFlags", []),
            "generatedAt": now_iso(),
        })
    except Exception as e:
        print(f"Error generating AI summary: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/concerns", methods=["POST"])
def create_concern():
    try:
        body = request.get_json(force=True)
        row = {
            "survey_id": body.get("surveyId"),
            "project_id": body.get("projectId"),
            "stakeholder_name": body.get("stakeholderName"),
            "concern_text": body.get("concernText"),
            "status": "open",
        }
        result = supabase.table("concerns").insert(row).execute()
        concern = result.data[0] if result.data else None
        return jsonify(concern_to_camel(concern)), 201
    except Exception as e:
        print(f"Error creating concern: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/api/concerns", methods=["GET"])
def list_concerns():
    try:
        project_id = request.args.get("projectId")
        status = request.args.get("status")
        q = supabase.table("concerns").select("*").order("created_at", desc=True)
        if project_id:
            q = q.eq("project_id", int(project_id))
        if status:
            q = q.eq("status", status)
        result = q.execute()
        concerns = [concern_to_camel(c) for c in (result.data or [])]
        return jsonify({"concerns": concerns})
    except Exception as e:
        print(f"Error fetching concerns: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/concerns/<int:concern_id>", methods=["GET"])
def get_concern(concern_id):
    try:
        result = supabase.table("concerns").select("*").eq("id", concern_id).single().execute()
        return jsonify(concern_to_camel(result.data))
    except Exception as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/concerns/<int:concern_id>/assign", methods=["PATCH"])
def assign_concern(concern_id):
    try:
        body = request.get_json(force=True)
        result = supabase.table("concerns").update({
            "assigned_to_sme_email": body.get("smeEmail"),
            "assigned_to_sme_name": body.get("smeName"),
            "status": "assigned",
            "updated_at": now_iso(),
        }).eq("id", concern_id).execute()
        concern = result.data[0] if result.data else None
        if not concern:
            return jsonify({"error": "Concern not found"}), 404
        return jsonify(concern_to_camel(concern))
    except Exception as e:
        print(f"Error assigning concern: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/api/concerns/<int:concern_id>/sme-response", methods=["PATCH"])
def sme_respond(concern_id):
    try:
        body = request.get_json(force=True)
        result = supabase.table("concerns").update({
            "sme_response": body.get("smeResponse"),
            "status": "responded",
            "updated_at": now_iso(),
        }).eq("id", concern_id).execute()
        concern = result.data[0] if result.data else None
        if not concern:
            return jsonify({"error": "Concern not found"}), 404
        return jsonify(concern_to_camel(concern))
    except Exception as e:
        print(f"Error submitting SME response: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/api/concerns/<int:concern_id>/manager-response", methods=["PATCH"])
def manager_respond(concern_id):
    try:
        body = request.get_json(force=True)
        result = supabase.table("concerns").update({
            "manager_response": body.get("managerResponse"),
            "status": "resolved",
            "updated_at": now_iso(),
        }).eq("id", concern_id).execute()
        concern = result.data[0] if result.data else None
        if not concern:
            return jsonify({"error": "Concern not found"}), 404
        return jsonify(concern_to_camel(concern))
    except Exception as e:
        print(f"Error submitting manager response: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/api/concerns/<int:concern_id>/resolve", methods=["PATCH"])
def resolve_concern(concern_id):
    try:
        result = supabase.table("concerns").update({
            "status": "resolved",
            "updated_at": now_iso(),
        }).eq("id", concern_id).execute()
        concern = result.data[0] if result.data else None
        if not concern:
            return jsonify({"error": "Concern not found"}), 404
        return jsonify(concern_to_camel(concern))
    except Exception as e:
        print(f"Error resolving concern: {e}")
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    is_dev = os.environ.get("NODE_ENV") != "production"
    print(f"Python Flask API server starting on port {port} (debug={is_dev})")
    app.run(host="0.0.0.0", port=port, debug=is_dev)
