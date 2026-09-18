import copy
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OPEN_CODE_PATH = ROOT / "9router-gpt-only-opencode.jsonc"
OMO_PATH = ROOT / "9router-gpt-only-omo.jsonc"
MODEL_IDS = {
    "luna": "9router/cx/gpt-5.6-luna",
    "terra": "9router/cx/gpt-5.6-terra",
    "sol": "9router/cx/gpt-5.6-sol",
    "astra": "9router/cx/gpt-6-astra",
}
LOCAL_VALUE = re.compile(r"(?:file:|localhost|127\.0\.0\.1|0\.0\.0\.0|/(?:root|home|tmp)/|\\\\)", re.I)
FALLBACK_KEY = re.compile(r"fallback", re.I)


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def fail(message):
    raise AssertionError(message)


def require(actual, expected, name):
    if actual != expected:
        fail(f"{name}: expected {expected!r}, got {actual!r}")


def walk(value, path="root"):
    if isinstance(value, dict):
        for key, nested in value.items():
            yield f"{path}.{key}", key, nested
            yield from walk(nested, f"{path}.{key}")
    elif isinstance(value, list):
        for index, nested in enumerate(value):
            yield from walk(nested, f"{path}[{index}]")


def reject_fallbacks(config):
    for path, key, value in walk(config):
        if FALLBACK_KEY.search(key) and not (path == "root.[opencode].model_fallback" and value is False):
            fail(f"fallback setting forbidden: {path}")


def validate_opencode(config):
    require(config.get("$schema"), "https://opencode.ai/config.json", "OpenCode schema")
    require(config.get("plugin"), ["oh-my-openagent@4.19.4", "@nebulesstech/opencode-9router@0.1.1"], "plugins")
    if "mcp" in config:
        fail("OpenCode MCP config forbidden")
    provider = config.get("provider", {}).get("9router", {})
    require(provider.get("npm"), "@ai-sdk/openai-compatible", "9Router npm adapter")
    require(provider.get("name"), "9Router", "9Router name")
    require(provider.get("options"), {"baseURL": "{env:NINE_ROUTER_BASE_URL}", "apiKey": "{env:NINE_ROUTER_API_KEY}"}, "9Router options")
    if "models" in provider:
        fail("provider.9router.models blocks dynamic thinking variants")
    require(config.get("model"), MODEL_IDS["terra"], "main model")
    expected_agents = {
        "explorer": (MODEL_IDS["luna"], "high"),
        "plan-consultant": (MODEL_IDS["astra"], "high"),
        "plan-reviewer": (MODEL_IDS["astra"], "high"),
        "adversarial-reviewer": (MODEL_IDS["sol"], "xhigh"),
        "implementer": (MODEL_IDS["luna"], "high"),
    }
    agents = config.get("agent", {})
    require(set(agents), set(expected_agents), "OpenCode agents")
    for name, (model, variant) in expected_agents.items():
        agent = agents[name]
        require(agent.get("mode"), "subagent", f"{name} mode")
        require(agent.get("model"), model, f"{name} model")
        require(agent.get("variant"), variant, f"{name} variant")
    for path, key, value in walk(config):
        if key in {"models", "variants"}:
            fail(f"static model data forbidden: {path}")
        if isinstance(value, str) and LOCAL_VALUE.search(value):
            fail(f"nonportable value forbidden: {path}")
        if key.lower() in {"apikey", "api_key", "token", "password"} and value != "{env:NINE_ROUTER_API_KEY}":
            fail(f"literal credential forbidden: {path}")
    reject_fallbacks(config)


def validate_omo(config):
    require(config.get("models"), {
        **{name: {"model": model, "reasoning": "high"} for name, model in MODEL_IDS.items()},
        "default": {"model": MODEL_IDS["terra"], "reasoning": "high"},
    }, "OMO model aliases")
    expected_agents = {
        "sisyphus": ("default", None),
        "explore": ("luna", None),
        "librarian": (MODEL_IDS["terra"], "xhigh"),
        "plan-consultant": ("astra", None),
        "plan-reviewer": ("astra", None),
        "adversarial-reviewer": (MODEL_IDS["sol"], "xhigh"),
        "implementer": ("luna", None),
    }
    require(set(config.get("agents", {})), set(expected_agents), "OMO agents")
    for name, (model, reasoning) in expected_agents.items():
        require(config["agents"][name].get("model"), model, f"OMO {name} model")
        require(config["agents"][name].get("reasoning"), reasoning, f"OMO {name} reasoning")
    expected_root_categories = {
        "architect": ("sol", None), "visual-engineering": ("luna", None),
        "ultrabrain": ("sol", None), "deep": ("sol", None), "artistry": ("terra", None),
        "quick": (MODEL_IDS["luna"], "medium"), "unspecified-low": (MODEL_IDS["luna"], "medium"),
        "unspecified-high": ("terra", None), "writing": (MODEL_IDS["luna"], "xhigh"),
    }
    require(set(config.get("categories", {})), set(expected_root_categories), "OMO categories")
    for name, (model, reasoning) in expected_root_categories.items():
        require(config["categories"][name].get("model"), model, f"OMO {name} category model")
        require(config["categories"][name].get("reasoning"), reasoning, f"OMO {name} category reasoning")
    expected_categories = {
        "architect": (MODEL_IDS["sol"], "high"), "visual-engineering": (MODEL_IDS["luna"], "high"),
        "ultrabrain": (MODEL_IDS["sol"], "high"), "deep": (MODEL_IDS["sol"], "high"),
        "artistry": (MODEL_IDS["terra"], "high"), "quick": (MODEL_IDS["luna"], "medium"),
        "unspecified-low": (MODEL_IDS["luna"], "medium"), "unspecified-high": (MODEL_IDS["terra"], "high"),
        "writing": (MODEL_IDS["luna"], "xhigh"),
    }
    opencode = config.get("[opencode]", {})
    require(opencode.get("model_fallback"), False, "model fallback")
    expected_opencode_agents = {
        "sisyphus": (MODEL_IDS["terra"], "high"), "hephaestus": (MODEL_IDS["sol"], "high"),
        "oracle": (MODEL_IDS["sol"], "high"), "explore": (MODEL_IDS["luna"], "high"),
        "librarian": (MODEL_IDS["terra"], "xhigh"), "multimodal-looker": (MODEL_IDS["luna"], "high"),
        "prometheus": (MODEL_IDS["astra"], "high"), "metis": (MODEL_IDS["astra"], "high"),
        "momus": (MODEL_IDS["astra"], "high"), "atlas": (MODEL_IDS["terra"], "high"),
        "sisyphus-junior": (MODEL_IDS["luna"], "high"), "plan-consultant": (MODEL_IDS["astra"], "high"),
        "plan-reviewer": (MODEL_IDS["astra"], "high"), "adversarial-reviewer": (MODEL_IDS["sol"], "xhigh"),
        "implementer": (MODEL_IDS["luna"], "high"),
    }
    require(set(opencode.get("agents", {})), set(expected_opencode_agents), "OpenCode compatibility agents")
    for name, (model, variant) in expected_opencode_agents.items():
        agent = opencode["agents"][name]
        require(agent.get("model"), model, f"OpenCode {name} model")
        require(agent.get("variant"), variant, f"OpenCode {name} variant")
    for name in {"plan-consultant", "plan-reviewer", "adversarial-reviewer", "implementer"}:
        require(opencode["agents"][name].get("mode"), "subagent", f"OpenCode {name} mode")
    require(set(opencode.get("categories", {})), set(expected_categories), "OpenCode categories")
    for name, (model, variant) in expected_categories.items():
        category = opencode["categories"][name]
        require(category.get("model"), model, f"{name} model")
        require(category.get("variant"), variant, f"{name} variant")
    profiles = config.get("profiles", {})
    expected_profiles = {"default": "terra", "economy": "luna", "complex": "sol", "planning": "astra"}
    require(set(profiles), set(expected_profiles), "profiles")
    for name, alias in expected_profiles.items():
        profile = profiles[name]
        require(profile["models"]["default"], {"model": MODEL_IDS[alias], "reasoning": "high"}, f"{name} profile")
        require(profile["[opencode]"]["agents"]["sisyphus"], {"model": MODEL_IDS[alias], "variant": "high"}, f"{name} profile agent")
    for path, key, value in walk(config):
        if isinstance(value, str) and value.startswith("9router/") and not value.startswith("9router/cx/gpt-"):
            fail(f"non-GPT model forbidden: {path}")
        if key in {"permissions", "hooks", "concurrency", "runtime_fallback"}:
            fail(f"unsupported OMO setting forbidden: {path}")
        if isinstance(value, str) and LOCAL_VALUE.search(value):
            fail(f"nonportable value forbidden: {path}")
        if key.lower() in {"apikey", "api_key", "token", "password"}:
            fail(f"literal credential forbidden: {path}")
    reject_fallbacks(config)


def expect_rejected(config, validator, mutation):
    broken = copy.deepcopy(config)
    mutation(broken)
    try:
        validator(broken)
    except AssertionError:
        return
    fail("mutation was accepted")


def main():
    opencode = load(OPEN_CODE_PATH)
    omo = load(OMO_PATH)
    validate_opencode(opencode)
    validate_omo(omo)
    expect_rejected(omo, validate_omo, lambda value: value["[opencode]"].update(model_fallback=True))
    expect_rejected(opencode, validate_opencode, lambda value: value["provider"]["9router"]["options"].update(apiKey="{env:ROUTER_API_KEY}"))
    expect_rejected(opencode, validate_opencode, lambda value: value["provider"]["9router"].update(models={MODEL_IDS["terra"]: {}}))
    print("9Router GPT-only presets: OK")


if __name__ == "__main__":
    main()
