CREATE TABLE Profissional (

	id_profissional SERIAL PRIMARY KEY,
	nome TEXT NOT NULL, 
	email TEXT NOT NULL,
	senha TEXT NOT NULL
);


CREATE TABLE Cliente (
	id_cliente SERIAL PRIMARY KEY,
	nome TEXT NOT NULL,
	email TEXT NOT NULL,
	senha TEXT NOT NULL
);

CREATE TYPE Servicos AS ENUM ('Residencial','Comercial');

CREATE TABLE Agendamento (
	id_agendamento SERIAL PRIMARY KEY,
	data_hora TIMESTAMP NOT NULL,
	cliente_id INTEGER NOT NULL REFERENCES Cliente(id_cliente),
	profissional_id INTEGER NOT NULL REFERENCES  Profissional(id_profissional),
	servicos Servicos NOT NULL
);


INSERT INTO Profissional (nome, email, senha) VALUES
	('Paulo', 'paulo@gmail', '12345678'),
	('Luiz', 'Luiz@gmail', '12345678'),
	('Marcos', 'Marcos@gmail', '12345678');


INSERT INTO Cliente (nome, email, senha) VALUES
	('Vitor', 'Vitor@gmail', '12345678'),
	('Claudio', 'Claudio@gmail', '12345678'),
	('Rodrigo', 'rodrigo@gmail', '12345678');


SELECT * FROM Profissional;

SELECT * FROM Cliente;


INSERT INTO Agendamento (data_hora, cliente_id, profissional_id, servicos) VALUES
	('2026-10-11 20:00:00', 2, 3, 'Residencial'),
	('2026-12-01 08:20:00', 1, 2, 'Comercial'),
	('2026-08-20 13:30:00', 3, 1, 'Residencial');

SELECT * FROM Agendamento;
