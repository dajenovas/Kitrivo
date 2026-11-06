from app.core.database import SessionLocal
from app.models import Permission, Role
from app.seed import seed_db

def update_permissions_and_roles():
    db = SessionLocal()
    try:
        # Run seed_db to insert/update permissions and roles
        seed_db(db)
        print("Successfully seeded permissions and roles!")

        # Verify new permissions
        manual_perm = db.query(Permission).filter(Permission.code == "LAB_MANUAL_READ").first()
        video_perm = db.query(Permission).filter(Permission.code == "DEMO_VIDEO_READ").first()

        print("LAB_MANUAL_READ permission:", manual_perm.name if manual_perm else "NOT FOUND")
        print("DEMO_VIDEO_READ permission:", video_perm.name if video_perm else "NOT FOUND")

        # Assign to SUPERADMIN if not already
        roles = db.query(Role).filter(Role.code.in_(["ROLE_SUPERADMIN"])).all()
        for role in roles:
            current_codes = {p.code for p in role.permissions}
            if manual_perm and manual_perm.code not in current_codes:
                role.permissions.append(manual_perm)
            if video_perm and video_perm.code not in current_codes:
                role.permissions.append(video_perm)
            db.commit()
            print(f"Role {role.code} now has {len(role.permissions)} permissions.")

    finally:
        db.close()

if __name__ == "__main__":
    update_permissions_and_roles()
