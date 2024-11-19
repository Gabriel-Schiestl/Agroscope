# AgroScope 🌾  

## Descrição do Projeto (Português)  
O **AgroScope** é uma solução tecnológica inovadora voltada para o diagnóstico de doenças em plantas. O sistema permite que produtores rurais enviem imagens de folhas das plantas pelo frontend, que são processadas por uma inteligência artificial baseada em redes neurais convolucionais (CNN). A IA analisa as imagens e prediz possíveis doenças, fornecendo suporte para o manejo e controle das mesmas.  

Atualmente, o sistema está configurado para identificar as doenças **ferrugem** e **cercosporiose do milho**, sendo uma base para expansões futuras.  

---

## Recursos Principais  
- **Interface Simples e Intuitiva**: O produtor pode fazer upload da imagem diretamente pelo frontend.  
- **Predição de Doenças**: Uso de redes neurais convolucionais para identificar características das folhas.  
- **Automatização do Processo**: Resposta ágil e automática sobre as possíveis doenças.  
- **Escalabilidade**: Sistema projetado para incluir novas doenças e plantas no futuro.  

---

## Estrutura do Sistema  
### **Frontend**  
- Desenvolvido em React.js (ou outra tecnologia frontend utilizada).  
- Permite ao usuário fazer o upload da imagem e receber a predição.  

### **Backend**  
- API construída com **Flask**.  
- Integração com o modelo de inteligência artificial.  
- Processamento das imagens enviadas e comunicação com a CNN.  

### **Inteligência Artificial**  
- Modelo treinado utilizando **CNN (Convolutional Neural Networks)**.  
- Base de dados contendo imagens de folhas infectadas por ferrugem e cercosporiose.  
- Pipeline de pré-processamento que inclui:  
  - Redimensionamento das imagens para 300x300 pixels.  
  - Normalização para valores entre 0 e 1.  

---

## Como Usar o AgroScope  
1. **Upload de Imagem**: Faça o upload de uma imagem da folha pelo frontend.  
2. **Processamento**: A imagem será enviada ao backend, que irá redimensioná-la e processá-la.  
3. **Predição**: O modelo CNN retornará a probabilidade de a planta estar infectada por ferrugem ou cercosporiose.  
4. **Resultado**: O resultado será exibido na tela, juntamente com recomendações.  

---

## Tecnologias Utilizadas  
- **Frontend**: React.js, Tailwind CSS (ou outra biblioteca de estilização).  
- **Backend**: Flask, Flask-CORS.  
- **Inteligência Artificial**: TensorFlow/Keras.  
- **Pré-processamento de Imagens**: PIL (Python Imaging Library).  

---

## Instalação e Execução  

### **Backend**  
1. Clone o repositório:  
   ```bash
   git clone https://github.com/seu-usuario/agroscope.git
   cd agroscope/backend
