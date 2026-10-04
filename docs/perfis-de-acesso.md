# 1. Perfis de Acesso

Os perfis de acesso definem os diferentes níveis de permissão dos usuários no sistema, considerando as responsabilidades associadas à utilização da aplicação. Para o sistema da Dsilk, foram identificados dois perfis de acesso: Administrador e Funcionário.

## 1.1 Administrador

O perfil Administrador corresponde ao usuário responsável pela gestão do sistema. Esse perfil possui acesso às funcionalidades operacionais da aplicação e às funcionalidades relacionadas ao gerenciamento dos funcionários.

Compete ao Administrador:
- gerenciar funcionários;
- cadastrar, consultar e editar materiais;
- cadastrar e consultar clientes;
- cadastrar serviços personalizados;
- configurar a composição dos serviços;
- calcular custos por metragem ou composição;
- criar, consultar e editar orçamentos;
- visualizar o planejamento semanal;
- registrar e editar atividades no planejamento.

## 1.2 Funcionário

O perfil Funcionário corresponde ao usuário que utiliza o sistema para realizar as atividades operacionais da gráfica. Esse perfil possui acesso às funcionalidades operacionais da aplicação, não sendo permitido o gerenciamento de funcionários.

Compete ao Funcionário:
- cadastrar, consultar e editar materiais;
- cadastrar e consultar clientes;
- cadastrar serviços personalizados;
- configurar a composição dos serviços;
- calcular custos por metragem ou composição;
- criar, consultar e editar orçamentos;
- visualizar o planejamento semanal;
- registrar e editar atividades no planejamento.

## 1.3 Matriz de Permissões

A Tabela 1 apresenta a relação entre as funcionalidades do sistema e os perfis de acesso definidos.

| Funcionalidade | Administrador | Funcionário |
| :--- | :---: | :---: |
| Gerenciar funcionários | ✓ | — |
| Autenticar no sistema | ✓ | ✓ |
| Cadastrar materiais | ✓ | ✓ |
| Consultar materiais | ✓ | ✓ |
| Editar materiais | ✓ | ✓ |
| Cadastrar clientes | ✓ | ✓ |
| Consultar clientes | ✓ | ✓ |
| Cadastrar serviços personalizados | ✓ | ✓ |
| Configurar composição de serviços | ✓ | ✓ |
| Calcular custos | ✓ | ✓ |
| Criar orçamentos | ✓ | ✓ |
| Consultar orçamentos | ✓ | ✓ |
| Editar orçamentos | ✓ | ✓ |
| Visualizar planejamento semanal | ✓ | ✓ |
| Registrar atividades | ✓ | ✓ |
| Editar atividades | ✓ | ✓ |

Os perfis e respectivas permissões deverão ser validados com o cliente antes da implementação definitiva, podendo ser ajustados conforme as necessidades identificadas durante o desenvolvimento do sistema.
