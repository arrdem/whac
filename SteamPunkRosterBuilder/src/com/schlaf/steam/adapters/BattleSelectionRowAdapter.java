/**
 * 
 */
package com.schlaf.steam.adapters;

import java.util.List;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import com.schlaf.steam.R;
import com.schlaf.steam.activities.battleselection.BattleSelector;
import com.schlaf.steam.storage.BattleListDescriptor;

/**
 * adapteur pour pr�sentation des entr�e de liste pour s�lection d'arm�e (c�t� �
 * selectionner)
 * 
 * @author S0085289
 * 
 */
public class BattleSelectionRowAdapter extends ArrayAdapter<BattleListDescriptor> {

	class ViewHolder {
		protected TextView title;
		protected TextView description1;
		protected TextView description2;
		protected ImageView imageFaction1;
		protected ImageView imageFaction2;
		protected ImageButton deleteButton;
	}

	private final List<BattleListDescriptor> list;
	private final Activity context;

	public BattleSelectionRowAdapter(Activity context,
			List<BattleListDescriptor> list) {
		super(context, R.layout.battle_list_selection, list);
		this.context = context;
		this.list = list;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {
		View view = null;
		
		BattleListDescriptor descriptor = list.get(position);
		
		if (convertView == null) {
			LayoutInflater inflator = context.getLayoutInflater();
			view = inflator.inflate(R.layout.battle_list_selection, null);
			final ViewHolder viewHolder = new ViewHolder();
			viewHolder.title = (TextView) view.findViewById(R.id.army_title);
			viewHolder.description1 = (TextView) view.findViewById(R.id.army_description);
			viewHolder.description2 = (TextView) view.findViewById(R.id.army_description2);
			viewHolder.imageFaction1 = (ImageView) view.findViewById(R.id.icon);
			viewHolder.imageFaction2 = (ImageView) view.findViewById(R.id.icon2);
			viewHolder.deleteButton = (ImageButton) view
					.findViewById(R.id.buttonDelete);
			view.setTag(viewHolder);
			viewHolder.deleteButton.setTag(descriptor);
		} else {
			view = convertView;
		}

		ViewHolder holder = (ViewHolder) view.getTag();
		holder.title.setText(descriptor.getTitle());
		holder.description1.setText(descriptor.getFaction1Description());
		holder.imageFaction1.setImageResource(descriptor.getFaction1().getLogoResource());
		
		if (descriptor.isTwoPlayers()) {
			holder.description2.setVisibility(View.VISIBLE);
			holder.imageFaction2.setVisibility(View.VISIBLE);
			
			holder.description2.setText(descriptor.getFaction2Description());
			holder.imageFaction2.setImageResource(descriptor.getFaction2().getLogoResource());
			
		} else {
			holder.description2.setVisibility(View.GONE);
			holder.imageFaction2.setVisibility(View.GONE);
		}
		
		holder.deleteButton.setFocusable(false);
		holder.deleteButton.setTag(list.get(position));

		holder.deleteButton.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				BattleListDescriptor battle = (BattleListDescriptor) v.getTag();
				((BattleSelector) BattleSelectionRowAdapter.this.context).deleteExistingBattle(battle);
			}
		});

		return view;
	}

}
