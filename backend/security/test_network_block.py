import sys

sys.path.insert(0, "backend")

from security.network import enforce_network_policy
from security.audit import log_event


def test_external_request_is_blocked():

    test_url = "https://example.com"

    try:
        enforce_network_policy(test_url)

        print("ERROR: External request was not blocked.")

        log_event(
            user_id="system",
            action="EXTERNAL_CALL_ALLOWED",
            model=None,
            resource=test_url,
            success=False,
            external_call=True,
            details="Security policy failed to block external request"
        )

    except PermissionError as e:

        print("BLOCKED SUCCESSFULLY")
        print(e)

        log_event(
            user_id="system",
            action="EXTERNAL_CALL_BLOCKED",
            model=None,
            resource=test_url,
            success=False,
            external_call=True,
            details="External network request blocked by security policy"
        )


if __name__ == "__main__":
    test_external_request_is_blocked()