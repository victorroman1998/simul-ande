from pathlib import Path
import pytest
from streamlit.testing.v1 import AppTest

APP = str(Path(__file__).resolve().parents[1] / "app.py")


def button(app, label):
    return next(b for b in app.button if b.label == label)


@pytest.mark.parametrize("facility", ["F_I2", "F_I4"])
def test_ui_complete_case_export_and_reset(facility):
    app = AppTest.from_file(APP, default_timeout=20).run()
    assert not app.exception
    app.selectbox[0].select(facility).run()
    button(app, "Iniciar práctica").click().run()
    assert button(app, "Confirmar recursos y atender").disabled
    app.checkbox[0].check().run()
    button(app, "Confirmar recursos y atender").click().run()
    assert app.radio[0].value is None
    button(app, "Confirmar decisión").click().run()
    assert "Selecciona una alternativa" in app.error[0].value
    for i in range(1, 7):
        app.radio[0].set_value(f"D{i}_A").run()
        button(app, "Confirmar decisión").click().run()
        assert not app.exception
    assert app.session_state["attempt"]["completed_at"]
    assert app.metric[0].value == "100 / 100"
    button(app, "Seleccionar reflexión").click().run()
    assert not app.exception
    assert app.session_state["attempt"]["tutor"]["mode"] == "local_fallback"
    button(app, "Comenzar otro intento").click().run()
    assert "attempt" not in app.session_state

