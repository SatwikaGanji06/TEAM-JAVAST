import ast
import operator


_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def calculate(expression: str) -> float:
    """
    Safely evaluate basic arithmetic expressions.
    """

    if not expression or not expression.strip():
        raise ValueError("Expression is required.")

    def evaluate(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value

        if isinstance(node, ast.UnaryOp) and type(node.op) in _OPERATORS:
            return _OPERATORS[type(node.op)](evaluate(node.operand))

        if isinstance(node, ast.BinOp) and type(node.op) in _OPERATORS:
            return _OPERATORS[type(node.op)](
                evaluate(node.left),
                evaluate(node.right),
            )

        raise ValueError("Unsupported expression.")

    try:
        tree = ast.parse(expression, mode="eval")
        return evaluate(tree.body)
    except (SyntaxError, TypeError, ValueError, ZeroDivisionError):
        raise ValueError("Invalid or unsupported expression.")
