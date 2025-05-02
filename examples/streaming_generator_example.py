import os

from dotenv import load_dotenv
from langchain_community.chat_models import ChatLiteLLM

from SallySalesBuddy.agents import SallySalesBuddy

load_dotenv()

llm = ChatLiteLLM(temperature=0.9, model_name="gpt-4o")

sales_agent = SallySalesBuddy.from_llm(
    llm,
    verbose=False,
    salesperson_name="Sally Sales Buddy",
    salesperson_role="Sales Representative",
    company_name="SmileCraft Aligners",
    company_business="""SmileCraft Aligners is a provider of custom-made, nearly invisible clear aligners that help people straighten their teeth discreetly and comfortably. Using advanced 3D imaging, our aligners are tailored to each individual's dental profile and offer a modern, convenient alternative to traditional metal braces."""
)

sales_agent.seed_agent()

# get generator of the LLM output
generator = sales_agent.step(stream=True)

# operate on streaming LLM output in near-real time
# for instance, do something after each full sentence is generated
for chunk in generator:
    print(chunk)
