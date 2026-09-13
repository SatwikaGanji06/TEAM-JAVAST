import ast
import operator
import re
from typing import Any


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

    def evaluate(node: ast.AST) -> float:
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


def _parse_natural_percentage(expression: str) -> float | None:
    """
    Support natural-language percentage calculations.

    Examples:
        15% of 800
        20 percent of 500
        15% of 800 + 10
    """

    text = expression.strip().lower()

    match = re.fullmatch(
        r"(\d+(?:\.\d+)?)\s*%?\s*(?:percent\s*)?(?:of)\s*"
        r"(\d+(?:\.\d+)?)",
        text,
    )

    if match:
        percentage = float(match.group(1))
        value = float(match.group(2))

        return (percentage / 100.0) * value

    return None


def _parse_percentage_of(expression: str) -> float | None:
    """
    Support:
        15 percent of 800
        15% of 800
    """

    return _parse_natural_percentage(expression)


def calculate(expression: str) -> float:
    """
    Safely evaluate arithmetic and common natural-language
    percentage expressions.
    """

    if not expression or not expression.strip():
        raise ValueError("Expression is required.")

    expression = expression.strip()

    # --------------------------------------------------------
    # Natural-language percentage
    # --------------------------------------------------------

    percentage_result = _parse_percentage_of(expression)

    if percentage_result is not None:
        return percentage_result

    # --------------------------------------------------------
    # Normal arithmetic
    # --------------------------------------------------------

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