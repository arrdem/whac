/**
 * 
 */
package com.schlaf.steam.adapters;

import java.util.List;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import com.schlaf.steam.R;
import com.schlaf.steam.activities.ChooseArmyListDialog.ChooseArmyListener;
import com.schlaf.steam.storage.ArmyListDescriptor;

/**
 * classe permettant de mapper une entrée de faction dans une liste de sélection
 * @author S0085289
 *
 */
public class ArmyListRowAdapter extends ArrayAdapter<ArmyListDescriptor> {
	
	  private final Context context;
	  private final List<ArmyListDescriptor> armies;

	  public ArmyListRowAdapter(Context context,  List<ArmyListDescriptor> armies) {
	    super(context, R.layout.army_list_selection, armies);
	    this.context = context;
	    this.armies = armies;
	  }

	  @Override
	  public View getView(int position, View convertView, ViewGroup parent) {
	    LayoutInflater inflater = (LayoutInflater) context
	        .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
	    
	    if (convertView == null) {
		    convertView = inflater.inflate(R.layout.army_list_selection, parent, false);
	    }
	    TextView title = (TextView) convertView.findViewById(R.id.army_title);
	    TextView description = (TextView) convertView.findViewById(R.id.army_description);
	    ImageView imageView = (ImageView) convertView.findViewById(R.id.icon);
	    title.setText(armies.get(position).getFileName());
	    description.setText( armies.get(position).getDescription());
	    imageView.setImageResource(armies.get(position).getFaction().getLogoResource());

	    ImageButton deleteButton = (ImageButton) convertView.findViewById(R.id.buttonDelete);
	    convertView.setTag(armies.get(position));
		deleteButton.setTag(armies.get(position));
		deleteButton.setFocusable(false);

		  deleteButton.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					ArmyListDescriptor army = (ArmyListDescriptor) v.getTag();
					((ChooseArmyListener) context).onArmyListDeleted(army);
				}
			});
		
	    return convertView;
	  }
	  
	
}
