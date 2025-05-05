import os
from unittest.mock import MagicMock, patch, AsyncMock

import pytest
from dotenv import load_dotenv

from SallySalesBuddy.sallysalesbuddyapi import SallySalesBuddyAPI

dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

from unittest.mock import patch


@pytest.fixture
def mock_SallySalesBuddy_step():
    with patch("SallySalesBuddy.sallysalesbuddyapi.SallySalesBuddy.step") as mock_step:
        mock_step.return_value = "Mock response"
        yield
'''
@pytest.fixture
def mock_SallySalesBuddy_astep():
    with patch("SallySalesBuddy.sallysalesbuddyapi.SallySalesBuddy.astep") as mock_step:
        mock_step.return_value = "Mock response"
        yield
'''
@pytest.fixture
def mock_SallySalesBuddy_astep():
    with patch("SallySalesBuddy.sallysalesbuddyapi.SallySalesBuddy.astep", new_callable=AsyncMock) as mock_step:
        mock_step.return_value = AsyncMock(return_value={
            "response": "Mock response",
            "intermediate_steps": []  # Ensure this key is present
        })
        yield

class TestSallySalesBuddyAPI:
    def test_initialize_agent_with_tools(self):
        api = SallySalesBuddyAPI(config_path="", use_tools=True)
        assert (
            api.sales_agent.use_tools == True
        ), "SallySalesBuddyAPI should initialize SallySalesBuddy with tools enabled."

    def test_initialize_agent_without_tools(self):
        api = SallySalesBuddyAPI(config_path="", use_tools=False)
        assert (
            api.sales_agent.use_tools == False
        ), "SallySalesBuddyAPI should initialize SallySalesBuddy with tools disabled."

    @pytest.mark.asyncio
    async def test_do_method_with_human_input(self, mock_SallySalesBuddy_astep):
        api = SallySalesBuddyAPI(config_path="", use_tools=False)
        payload = await api.do(human_input="Hello")
        # TODO patch conversation_history to be able to check correctly
        print(payload)
        assert (
            "User: Hello <END_OF_TURN>" in api.sales_agent.conversation_history
        ), "Human input should be added to the conversation history."
        assert (
            payload["response"] == "Hello "
        ), "The payload response should match the mock response. {}".format(payload)

    @pytest.mark.asyncio
    async def test_do_method_with_human_input_anthropic(self, mock_SallySalesBuddy_astep):
        api = SallySalesBuddyAPI(config_path="", use_tools=False, model_name="anthropic.claude-3-sonnet-20240229-v1:0")
        payload = await api.do(human_input="Hello")
        assert (
            "User: Hello <END_OF_TURN>" in api.sales_agent.conversation_history
        ), "Human input should be added to the conversation history."
        assert (
            payload["response"] == "Hello "
        ), "The payload response should match the mock response. {}".format(payload)

    @pytest.mark.asyncio
    async def test_do_method_without_human_input(self, mock_SallySalesBuddy_astep):
        api = SallySalesBuddyAPI(config_path="", use_tools=False)
        payload = await api.do()
        # TODO patch conversation_history to be able to check correctly
        assert (
            payload["response"] == ""
        ), "The payload response should match the mock response when no human input is provided."

    # @pytest.mark.asyncio
    # async def test_do_stream_method(self):
    #     api = SallySalesBuddyAPI(config_path="", use_tools=False)
    #     stream_gen = api.do_stream(conversation_history=[])
    #     async for response in stream_gen:
    #         assert response == "Agent: Mock response <END_OF_TURN>", "Stream generator should yield the mock response."
    @pytest.mark.asyncio
    async def test_payload_structure(self):
        api = SallySalesBuddyAPI(config_path="", use_tools=False)
        payload = await api.do(human_input="Test input")
        expected_keys = [
            "bot_name",
            "response",
            "conversational_stage",
            "tool",
            "tool_input",
            "action_output",
            "action_input",
        ]
        for key in expected_keys:
            assert key in payload, f"Payload missing expected key: {key}"
