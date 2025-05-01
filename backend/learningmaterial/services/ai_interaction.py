from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
load_dotenv() # can access API key fron .env 


llm = ChatOpenAI()
response = llm.invoke("Hello, world!")
print(response.content)
