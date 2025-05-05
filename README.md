# AgroScope 🌾  

## Descrição do Projeto (Português)  
O **AgroScope** é uma solução tecnológica inovadora que visa auxíliar produtores, engenheiros agrônomos e cooperativas a gerencias suas atividades. Entre as funcionalidades em destaque, podemos citar:
- Predição de aplicações de insumos e calendário de aplicação (analisando o tempo, clima, cultura e etc).
- Análise de mercado e predição para venda.
- Análise de crédito e gasto de produtores (prospectar clientes aos agrônomos).
- Outras..

Atualmente, a inteligência artificial está configurada para identificar diferentes doenças em diferentes plantas (milho, soja, trigo).

---

## Recursos Principais  
- **Interface Simples e Intuitiva**: O produtor pode fazer upload da imagem diretamente pelo frontend.  
- **Predição de Doenças**: Uso de redes neurais convolucionais para identificar características das folhas. Além de outros modelos inteligêntes que visam auxíliar o cliente.
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
- Base de dados contendo imagens de folhas infectadas por diversas doenças diferentes.
- Capacidade de identificar doenças com os menores indícios possíveis.

---

## Tecnologias Utilizadas  
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Flask, Flask-CORS
- **Filtros Personalizados**: openCV/CV2
- **Inteligência Artificial**: pyTorch
- **Pré-processamento de Imagens**: PIL (Python Imaging Library), Numpy
