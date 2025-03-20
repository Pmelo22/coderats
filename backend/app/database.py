from appwrite.client import Client
from appwrite.services.databases import Databases
import os

# Configuração do Appwrite
client = Client()
client.set_endpoint(os.getenv("APPWRITE_ENDPOINT"))  # URL do seu servidor Appwrite
client.set_project(os.getenv("APPWRITE_PROJECT_ID"))  # ID do seu projeto no Appwrite
client.set_key(os.getenv("APPWRITE_API_KEY"))  # API Key do seu Appwrite

# Inicializa o serviço de banco de dados
database = Databases(client)

# IDs das suas collections
DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
COLLECTION_RANKINGS = os.getenv("APPWRITE_COLLECTION_RANKINGS")

def get_rankings():
    """ Obtém a lista de rankings do banco de dados no Appwrite """
    try:
        rankings = database.list_documents(DATABASE_ID, COLLECTION_RANKINGS)
        return rankings["documents"]
    except Exception as e:
        print(f"Erro ao buscar rankings: {e}")
        return []
