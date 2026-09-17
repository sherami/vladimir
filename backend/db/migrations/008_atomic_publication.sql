-- One immutable publication per property analysis version.
-- Publication creation and workflow advancement are committed in one transaction.
create unique index if not exists ux_pp_publications_property
  on pp_publications(property_id);
