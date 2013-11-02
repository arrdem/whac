/**
 * 
 */
package com.schlaf.steam.activities.selectlist;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

import android.app.Activity;
import android.content.Context;
import android.text.Html;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.BaseExpandableListAdapter;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import com.schlaf.steam.R;
import com.schlaf.steam.activities.card.ViewCardFragment.ViewCardActivityInterface;
import com.schlaf.steam.activities.selectlist.selected.BeastCommander;
import com.schlaf.steam.activities.selectlist.selected.JackCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedArmyCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedBattleEngine;
import com.schlaf.steam.activities.selectlist.selected.SelectedEntry;
import com.schlaf.steam.activities.selectlist.selected.SelectedItem;
import com.schlaf.steam.activities.selectlist.selected.SelectedJourneyManWarcaster;
import com.schlaf.steam.activities.selectlist.selected.SelectedLesserWarlock;
import com.schlaf.steam.activities.selectlist.selected.SelectedModel;
import com.schlaf.steam.activities.selectlist.selected.SelectedSection;
import com.schlaf.steam.activities.selectlist.selected.SelectedSection.SectionTypeEnum;
import com.schlaf.steam.activities.selectlist.selected.SelectedSolo;
import com.schlaf.steam.activities.selectlist.selected.SelectedSoloMarshal;
import com.schlaf.steam.activities.selectlist.selected.SelectedUA;
import com.schlaf.steam.activities.selectlist.selected.SelectedUnit;
import com.schlaf.steam.activities.selectlist.selected.SelectedWA;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarbeast;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarjack;
import com.schlaf.steam.adapters.ModelFlingGestureListener;

/**
 * adapteur pour présentation des entrée de liste pour sélection d'armée (côté à
 * selectionner)
 * 
 * @author S0085289
 * 
 */
public class ListSelectedAdapter extends BaseExpandableListAdapter {


	private Activity activity;
	/** liste des modèles sélectionnés 
	 * <br> replicate from SelectionModelSingleton.get
	 * @see SelectionModelSingleton
	 */
	List<SelectedEntry> entries = SelectionModelSingleton.getInstance().getSelectedEntries();
	
	/** liste des groupes, calculés à partir des modèles disponibles */
	List<SelectedItem> groups; // casters, then units, then solos
	
	/**
	 * constructeur avec la liste initiale de modeles
	 * 
	 * @param activity
	 * @param models
	 * @param faction
	 */
	public ListSelectedAdapter(Activity activity) {
		if ( ! (activity instanceof ArmySelectionChangeListener)) {
			throw new UnsupportedOperationException("ListSelectedAdapter must receive a ArmySelectionChangeListener as parent activity");
		}
		if ( ! (activity instanceof ViewCardActivityInterface)) {
			throw new UnsupportedOperationException("ListSelectedAdapter must receive a ViewCardActivityInterface as parent activity");
		}

		this.activity = activity;

		createGroupsFromModels();
	}

	/**
	 * à partir de la liste des models, extrait les groupes disponibles
	 * 1 caster = 1 groupe (contient caster attachment + jacks/beasts)
	 * 1 unité = 1 groupe ( contient unit attachment + Weapon attachment)
	 * 1 solo = 1 groupe
	 * 1 BE = 1 groupe
	 * les warjacks/beasts (hors Avatar) sont dans le groupe du caster
	 */
	private void createGroupsFromModels() {

		groups = new ArrayList<SelectedItem>();
		HashMap<String, SelectedItem> sectionGroups = new HashMap<String, SelectedItem>();

		for (SelectedEntry entry : entries) {
			
			if (entry instanceof SelectedArmyCommander) {
				SelectedSection commanderSection = new SelectedSection(SectionTypeEnum.CASTER);
				if (! sectionGroups.containsKey("Commanders")) {
					sectionGroups.put("Commanders", commanderSection);
				}
				groups.add(entry);
			}
			
			if (entry instanceof SelectedUnit) {
				SelectedSection commanderSection = new SelectedSection(SectionTypeEnum.UNIT);
				if (! sectionGroups.containsKey("Units")) {
					sectionGroups.put("Units", commanderSection);
				}
				groups.add(entry);
			}
			
			if (entry instanceof SelectedSolo) {
				SelectedSection commanderSection = new SelectedSection(SectionTypeEnum.SOLO);
				if (! sectionGroups.containsKey("Solos")) {
					sectionGroups.put("Solos", commanderSection);
				}
				groups.add(entry);
			}
			
			if (entry instanceof SelectedBattleEngine) {
				SelectedSection commanderSection = new SelectedSection(SectionTypeEnum.BATTLE_ENGINE);
				if (! sectionGroups.containsKey("Battle Engines")) {
					sectionGroups.put("Battle Engines", commanderSection);
				}
				groups.add(entry);
			}
		}
		
		groups.addAll(sectionGroups.values());

		Collections.sort(groups);
	}

	@Override
	public Object getChild(int groupPosition, int childPosition) {
		SelectedEntry group = (SelectedEntry) groups.get(groupPosition);
		
		if (group instanceof SelectedArmyCommander) {
			SelectedModel attachment = ((SelectedArmyCommander) group).getAttachment();
			if (attachment != null ) {
				if (childPosition == 0) {
					return attachment;
				} else {
					return ((SelectedArmyCommander) group).getAttachedModels().get(childPosition-1); 
				}
			} else {
				return ((SelectedArmyCommander) group).getAttachedModels().get(childPosition);	
			}
		}
		if (group instanceof SelectedUnit) {
			return ((SelectedUnit) group).getChilds().get(childPosition);
		}
		if (group instanceof JackCommander) {
			return ((JackCommander) group).getJacks().get(childPosition);
		}
		if (group instanceof BeastCommander) {
			return ((BeastCommander) group).getBeasts().get(childPosition);
		}
		return null;
	}

	@Override
	public long getChildId(int groupPosition, int childPosition) {
		return groupPosition * 1000 + childPosition;
	}

	@Override
	public View getChildView(int groupPosition, int childPosition,
			boolean isLastChild, View convertView, ViewGroup parent) {

		final SelectedEntry entry = (SelectedEntry) getChild(
				groupPosition, childPosition);

		if (convertView == null) {
			LayoutInflater inflater = (LayoutInflater) activity
					.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
			convertView = inflater.inflate(R.layout.row_army_selected_child,
					null);
		}
		
		// to handle left/right swipe
//		final ModelFlingGestureListener flingListener = new ModelFlingGestureListener(convertView, activity);
//		convertView.setOnTouchListener(flingListener);
//		convertView.setTag(entry);



		// association de la vue et du model
		HashMap<String, SelectedEntry> model = new HashMap<String, SelectedEntry>();
		model.put("group", (SelectedEntry) getGroup(groupPosition));
		model.put("child", entry);
		convertView.setTag(entry);
		
		drawEntryView(convertView, entry);
		
		ImageView image = (ImageView) convertView.findViewById(R.id.childImage);
		image.setTag(entry);
//		image.setOnClickListener(new View.OnClickListener() {
//			@Override
//			public void onClick(View v) {
//				SelectedEntry currentEntry = (SelectedEntry) v.getTag();
//				SelectionEntry model = SelectionModelSingleton.getInstance().getSelectionEntryById(currentEntry.getId());
//				((ArmySelectionChangeListener) ListSelectedAdapter.this.activity).viewModelDetail(model);
//			}
//		});

		// gesture listener, flip --> to select, <-- to unselect
//		final ModelFlingGestureListener flingListener = new ModelFlingGestureListener(this, convertView, entry, activity);
//		convertView.setOnTouchListener(flingListener);
		ImageButton deleteButton = (ImageButton) convertView.findViewById(R.id.buttonDelete);
		deleteButton.setTag(model);
		deleteButton.setFocusable(false);
		deleteButton.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				@SuppressWarnings("unchecked")
				HashMap<String, SelectedEntry> model = (HashMap<String, SelectedEntry>) v.getTag();
				SelectedEntry group = model.get("group");
				SelectedEntry child = model.get("child");
				SelectionModelSingleton.getInstance().removeSelectedSubEntry(group, child);
				notifyDataSetChanged();
				((ArmySelectionChangeListener) ListSelectedAdapter.this.activity).notifyArmyChange();
			}
		});
		
		return convertView;
	}

	protected void drawEntryView(View convertView,
			final SelectedEntry model) {
		ImageView image = (ImageView) convertView.findViewById(R.id.childImage);
		if (model instanceof SelectedUA) {
			image.setImageResource(R.drawable.ua_icon);
		}
		if (model instanceof SelectedWA) {
			image.setImageResource(R.drawable.wa_icon);
		}
		if (model instanceof SelectedWarjack) {
			image.setImageResource(R.drawable.j_icon);
		}
		if (model instanceof SelectedWarbeast) {
			image.setImageResource(R.drawable.b_icon);
		}
		if (model instanceof SelectedSolo) {
			image.setImageResource(R.drawable.s_icon);
		}
		if (model instanceof SelectedBattleEngine) {
			image.setImageResource(R.drawable.b_icon);
		}
		
		TextView tvDetail = (TextView) convertView.findViewById(R.id.entry_detail);
		tvDetail.setText(Html.fromHtml(model.toFullString()));
	}

	@Override
	public int getChildrenCount(int groupPosition) {
		SelectedItem group = groups.get(groupPosition);
		
		if (group instanceof SelectedSection) {
			return 0;
		}
		
		if (group instanceof SelectedArmyCommander) {
			int addAttachment = 0;
			if (((SelectedArmyCommander) group).getAttachment() != null) {
				addAttachment = 1;
			}
			return ((SelectedArmyCommander) group).getAttachedModels().size() + addAttachment;
		}
		if (group instanceof SelectedUnit) {
			return ((SelectedUnit) group).getChilds().size();
		}
		if (group instanceof SelectedSoloMarshal) {
			return ((SelectedSoloMarshal) group).getJacks().size();
		}
		if (group instanceof SelectedJourneyManWarcaster) {
			return ((SelectedJourneyManWarcaster) group).getJacks().size();
		}
		if (group instanceof SelectedLesserWarlock) {
			return ((SelectedLesserWarlock) group).getBeasts().size();
		}
		if (group instanceof SelectedSolo) { // by the way, not a solo marshall...
			return 0; 
		}
		if (group instanceof SelectedBattleEngine) { 
			return 0; 
		}
		return 0;
	}

	@Override
	public Object getGroup(int groupPosition) {
		return groups.get(groupPosition);
	}

	@Override
	public int getGroupCount() {
		return groups.size();
	}

	@Override
	public long getGroupId(int groupPosition) {
		return groupPosition * 1000;
	}

	@Override
	public View getGroupView(int groupPosition, boolean isExpanded,
			View convertView, ViewGroup parent) {
		
		SelectedItem maybeSection = (SelectedItem) getGroup(groupPosition);
		
		if (maybeSection instanceof SelectedSection) {
			LayoutInflater inflater = (LayoutInflater) activity
					.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
			convertView = inflater.inflate(R.layout.row_army_selected_section,
					null);
			TextView tvLabel = (TextView) convertView.findViewById(R.id.section_label);
			tvLabel.setText(((SelectedSection)maybeSection).getLabelId());
			
			return convertView;
		} 

		SelectedEntry group = (SelectedEntry) maybeSection;
		
		LayoutInflater inflater = (LayoutInflater) activity
				.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
		convertView = inflater.inflate(R.layout.row_army_selected_group,
					null);

		// to handle left/right swipe
//		final ModelFlingGestureListener flingListener = new ModelFlingGestureListener(convertView, activity);
//		convertView.setOnTouchListener(flingListener);
//		convertView.setTag(group);
		
		ImageView image = (ImageView) convertView.findViewById(R.id.groupImage);
		
		if (group instanceof SelectedArmyCommander) {
			image.setImageResource(R.drawable.w_icon);
		} else if (group instanceof SelectedUnit) {
			image.setImageResource(R.drawable.u_icon);
		} else if (group instanceof SelectedSolo) {
			image.setImageResource(R.drawable.s_icon);
		}
		
		TextView tvLabel = (TextView) convertView.findViewById(R.id.def_arm_label);
		// tvLabel.setTextAppearance(activity, FactionNamesEnum.MENOTH.getStyleResource());
		tvLabel.setText(Html.fromHtml(group.getLabel()));
		
		TextView tvDetail = (TextView) convertView.findViewById(R.id.detail);
		tvDetail.setText(Html.fromHtml(group.getModelCountString() + group.getCostString()));
		
		
		ImageButton deleteButton = (ImageButton) convertView.findViewById(R.id.buttonDelete);
		deleteButton.setTag(group);
		deleteButton.setFocusable(false);
		deleteButton.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				SelectedEntry entry = (SelectedEntry) v.getTag();
				SelectionModelSingleton.getInstance().removeSelectedEntry(entry);
				notifyDataSetChanged();
				((ArmySelectionChangeListener) ListSelectedAdapter.this.activity).notifyArmyChange();
			}
		});		
		
		image.setTag(group);
//		image.setOnClickListener(new View.OnClickListener() {
//			@Override
//			public void onClick(View v) {
//				SelectedEntry currentEntry = (SelectedEntry) v.getTag();
//				SelectionEntry model = SelectionModelSingleton.getInstance().getSelectionEntryById(currentEntry.getId());
//				((ArmySelectionChangeListener) ListSelectedAdapter.this.activity).viewModelDetail(model);
//			}
//		});
		
		convertView.setFocusable(false);
		
		return convertView;
	}

	@Override
	public boolean hasStableIds() {
		return false;
	}

	@Override
	public boolean isChildSelectable(int groupPosition, int childPosition) {
		// on ne sélectionne qu'avec les boutons dédiés
		return true;
	}

	@Override
	public void notifyDataSetChanged() {
		createGroupsFromModels();
		super.notifyDataSetChanged();
	}


}
