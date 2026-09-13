import ast
import operator
import re


_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _evaluate_ast(expression: str) -> float:
    """Safely evaluate basic arithmetic expressions."""

    tree = ast.parse(expression, mode="eval")

    def evaluate(node):
        if (
            isinstance(node, ast.Constant)
            and isinstance(node.value, (int, float))
        ):
            return node.value

        if (
            isinstance(node, ast.UnaryOp)
            and type(node.op) in _OPERATORS
        ):
            return _OPERATORS[type(node.op)](
                evaluate(node.operand)
            )

        if (
            isinstance(node, ast.BinOp)
            and type(node.op) in _OPERATORS
        ):
            return _OPERATORS[type(node.op)](
                evaluate(node.left),
                evaluate(node.right),
            )

        raise ValueError("Unsupported expression.")

    return evaluate(tree.body)


def _parse_percentage(expression: str) -> float | None:
    """
    Handle natural-language percentage expressions.

    Examples:
        15% of 800
        20 percent of 500
        7.5% of 200
    """

    text = expression.strip().lower()

    pattern = (
        r"^(\d+(?:\.\d+)?)\s*"
        r"(?:%|percent|percentage)\s+of\s+"
        r"(\d+(?:\.\d+)?)$"
    )

    match = re.match(pattern, text)

    if not match:
        return None

    percentage = float(match.group(1))
    value = float(match.group(2))

    return (percentage / 100.0) * value


def calculate(expression: str) -> float:
    """
    Safely evaluate arithmetic expressions and
    common natural-language percentage calculations.
    """

    if not expression or not expression.strip():
        raise ValueError("Expression is required.")

    expression = expression.strip()

    # Natural-language percentage
    percentage_result = _parse_percentage(expression)

    if percentage_result is not None:
        return percentage_result

    # Normal arithmetic
    try:
        return _evaluate_ast(expression)

    except (
        SyntaxError,
        TypeError,
        ValueError,
        ZeroDivisionError,
    ):
        raise ValueError(
            "Invalid or unsupported expression."
        )