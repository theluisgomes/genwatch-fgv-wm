.PHONY: spec-validate spec-codegen spec-check spec-summary spec-phase-check test install dev-api dev-web

PYTHON := python3
SPEC_CLI := cd tools/spec-cli && $(PYTHON) -m spec_cli.cli

install:
	$(PYTHON) -m pip install -r tools/spec-cli/requirements.txt
	$(PYTHON) -m pip install -r apps/api/requirements.txt

spec-validate:
	$(SPEC_CLI) validate

spec-codegen:
	$(SPEC_CLI) codegen

spec-codegen-check:
	$(SPEC_CLI) codegen --check

spec-check:
	$(SPEC_CLI) check

spec-phase-check:
	$(SPEC_CLI) phase-check --phase 1
	$(SPEC_CLI) phase-check --phase 2
	$(SPEC_CLI) phase-check --phase 3
	$(SPEC_CLI) phase-check --phase 4

spec-summary:
	$(SPEC_CLI) summary

test:
	$(PYTHON) -m pytest tests/ -q

dev-api:
	cd apps/api && $(PYTHON) -m uvicorn main:app --reload --port 8000

dev-web:
	cd apps/web && npm run dev
