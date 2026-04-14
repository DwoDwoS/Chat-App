import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, Message


@pytest.fixture
def db_session():
    """Crée une base en mémoire pour chaque test."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_create_message(db_session):
    """Un message peut être stocké et relu."""
    msg = Message(username="alice", text="hello")
    db_session.add(msg)
    db_session.commit()

    result = db_session.query(Message).first()
    assert result is not None
    assert result.username == "alice"
    assert result.text == "hello"


def test_message_has_auto_fields(db_session):
    """id et created_at sont générés automatiquement."""
    msg = Message(username="bob", text="world")
    db_session.add(msg)
    db_session.commit()

    result = db_session.query(Message).first()
    assert result.id is not None
    assert result.created_at is not None